from io import BytesIO
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT

from app.core.db import get_db
from app.core.permissions import require_min_level
from app.models.user import User
from app.models.intervention import Intervention
from app.models.reports import Report

router = APIRouter(tags=["export"])

# Couleurs de l'application
DARK_GREEN = colors.Color(0.243, 0.318, 0.325)      # #3E5153
MEDIUM_GREEN = colors.Color(0.255, 0.435, 0.435)     # #416F6F
LIGHT_BG = colors.Color(0.992, 0.973, 0.925)         # #FDF8F2
GOLD = colors.Color(1.0, 0.82, 0.585)                # #FFD195
OLIVE = colors.Color(0.616, 0.62, 0.506)             # #9D9E81
TEXT_DARK = colors.Color(0.243, 0.318, 0.325)         # #3E5153
TEXT_MUTED = colors.Color(0.384, 0.51, 0.463)         # #628276

STATUS_COLORS = {
    "PENDING": colors.Color(0.92, 0.78, 0.2),
    "VALIDATED": colors.Color(0.23, 0.51, 0.78),
    "ASSIGNED": colors.Color(0.31, 0.36, 0.71),
    "PROCESSING": colors.Color(0.58, 0.34, 0.7),
    "CLOSED": colors.Color(0.2, 0.72, 0.53),
    "REJECTED": colors.Color(0.85, 0.25, 0.25),
}

STATUS_LABELS = {
    "PENDING": "En attente",
    "VALIDATED": "Validée",
    "ASSIGNED": "Assignée",
    "PROCESSING": "En cours",
    "CLOSED": "Clôturée",
    "REJECTED": "Rejetée",
}


def _build_styles():
    """Construit les styles personnalisés pour le PDF"""
    styles = getSampleStyleSheet()
    
    styles.add(ParagraphStyle(
        name="DocTitle",
        fontName="Helvetica-Bold",
        fontSize=18,
        textColor=DARK_GREEN,
        alignment=TA_CENTER,
        spaceAfter=6,
    ))
    styles.add(ParagraphStyle(
        name="DocSubtitle",
        fontName="Helvetica",
        fontSize=10,
        textColor=TEXT_MUTED,
        alignment=TA_CENTER,
        spaceAfter=20,
    ))
    styles.add(ParagraphStyle(
        name="SectionTitle",
        fontName="Helvetica-Bold",
        fontSize=13,
        textColor=DARK_GREEN,
        spaceBefore=16,
        spaceAfter=8,
    ))
    styles.add(ParagraphStyle(
        name="CellLabel",
        fontName="Helvetica-Bold",
        fontSize=9,
        textColor=colors.white,
    ))
    styles.add(ParagraphStyle(
        name="CellValue",
        fontName="Helvetica",
        fontSize=9,
        textColor=TEXT_DARK,
        leading=13,
    ))
    styles.add(ParagraphStyle(
        name="ReportType",
        fontName="Helvetica-Bold",
        fontSize=10,
        textColor=DARK_GREEN,
    ))
    styles.add(ParagraphStyle(
        name="ReportDesc",
        fontName="Helvetica",
        fontSize=9,
        textColor=TEXT_DARK,
        leading=13,
    ))
    styles.add(ParagraphStyle(
        name="Footer",
        fontName="Helvetica",
        fontSize=7,
        textColor=TEXT_MUTED,
        alignment=TA_CENTER,
    ))
    return styles


def _format_date(dt) -> str:
    if dt is None:
        return "—"
    return dt.strftime("%d/%m/%Y à %H:%M")


@router.get("/{id}/pdf")
def export_intervention_pdf(
    id: int,
    _current_user: User = Depends(require_min_level(3)),
    db: Session = Depends(get_db),
):
    """Exporte une intervention complète en PDF avec ses rapports"""
    intervention = db.query(Intervention).filter(Intervention.id == id).first()
    if intervention is None:
        raise HTTPException(status_code=404, detail="Intervention introuvable")

    reports = db.query(Report).filter(Report.intervention_id == id).all()

    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=25 * mm,
        rightMargin=25 * mm,
        topMargin=20 * mm,
        bottomMargin=20 * mm,
    )
    styles = _build_styles()
    elements = []

    # === EN-TÊTE ===
    elements.append(Paragraph("ATHÉNÉE ROYAL DE COMINES", styles["DocTitle"]))
    elements.append(Paragraph("Portail de gestion des interventions", styles["DocSubtitle"]))
    elements.append(HRFlowable(width="100%", thickness=2, color=DARK_GREEN, spaceAfter=15))

    # Titre du rapport
    elements.append(Paragraph(f"Intervention #{intervention.id}", styles["SectionTitle"]))

    # === STATUT ===
    status_label = STATUS_LABELS.get(intervention.status, intervention.status)
    status_color = STATUS_COLORS.get(intervention.status, TEXT_MUTED)
    status_table = Table(
        [[Paragraph(f"Statut : {status_label}", ParagraphStyle(
            name="StatusText", fontName="Helvetica-Bold", fontSize=10, textColor=colors.white
        ))]],
        colWidths=[500],
    )
    status_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), status_color),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("ROUNDEDCORNERS", [4, 4, 4, 4]),
    ]))
    elements.append(status_table)
    elements.append(Spacer(1, 15))

    # === DÉTAILS ===
    elements.append(Paragraph("Détails de l'intervention", styles["SectionTitle"]))

    detail_rows = [
        ["Titre", intervention.title],
        ["Description", intervention.description or "—"],
        ["Lieu", intervention.location],
        ["Type", "Informatique" if intervention.type == "IT" else "Personnel de maîtrise"],
    ]

    detail_table = Table(
        [[Paragraph(r[0], styles["CellLabel"]), Paragraph(r[1], styles["CellValue"])] for r in detail_rows],
        colWidths=[120, 380],
    )
    detail_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), DARK_GREEN),
        ("BACKGROUND", (1, 0), (1, -1), LIGHT_BG),
        ("GRID", (0, 0), (-1, -1), 0.5, OLIVE),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
    ]))
    elements.append(detail_table)
    elements.append(Spacer(1, 15))

    # === CHRONOLOGIE ===
    elements.append(Paragraph("Chronologie", styles["SectionTitle"]))

    timeline_rows = [["Étape", "Date"]]
    timeline_rows.append(["Création", _format_date(intervention.created_at)])
    if intervention.validated_at:
        timeline_rows.append(["Validation", _format_date(intervention.validated_at)])
    if intervention.assigned_at:
        timeline_rows.append(["Assignation", _format_date(intervention.assigned_at)])
    if intervention.processing_at:
        timeline_rows.append(["Prise en charge", _format_date(intervention.processing_at)])
    if intervention.closed_at:
        timeline_rows.append(["Clôture", _format_date(intervention.closed_at)])
    if intervention.rejected_at:
        timeline_rows.append(["Rejet", _format_date(intervention.rejected_at)])

    timeline_table = Table(
        [[Paragraph(r[0], styles["CellLabel"] if i == 0 else styles["CellValue"]),
          Paragraph(r[1], styles["CellLabel"] if i == 0 else styles["CellValue"])]
         for i, r in enumerate(timeline_rows)],
        colWidths=[250, 250],
    )
    timeline_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), DARK_GREEN),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("BACKGROUND", (0, 1), (-1, -1), LIGHT_BG),
        ("GRID", (0, 0), (-1, -1), 0.5, OLIVE),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [LIGHT_BG, colors.white]),
    ]))
    elements.append(timeline_table)
    elements.append(Spacer(1, 20))

    # === RAPPORTS ===
    elements.append(Paragraph("Rapports associés", styles["SectionTitle"]))
    elements.append(HRFlowable(width="100%", thickness=1, color=OLIVE, spaceAfter=10))

    if reports:
        type_labels = {
            "CLOSURE": "Rapport de clôture",
            "PROBLEM": "Signalement de problème",
            "REFUSAL": "Justification de refus",
        }
        type_icons = {
            "CLOSURE": "✓",
            "PROBLEM": "⚠",
            "REFUSAL": "✗",
        }

        for report in reports:
            rtype = report.type.value.upper()
            label = type_labels.get(rtype, rtype)
            icon = type_icons.get(rtype, "•")

            report_rows = [
                [f"{icon}  {label}", _format_date(report.created_at)],
                [report.description, ""],
            ]

            rt = Table(
                [[Paragraph(report_rows[0][0], styles["ReportType"]),
                  Paragraph(report_rows[0][1], styles["CellValue"])],
                 [Paragraph(report_rows[1][0], styles["ReportDesc"]), ""]],
                colWidths=[350, 150],
            )
            rt.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.Color(0.95, 0.95, 0.93)),
                ("BACKGROUND", (0, 1), (-1, 1), colors.white),
                ("GRID", (0, 0), (-1, -1), 0.5, OLIVE),
                ("SPAN", (0, 1), (1, 1)),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
            ]))
            elements.append(rt)
            elements.append(Spacer(1, 10))
    else:
        elements.append(Paragraph("Aucun rapport associé à cette intervention.", styles["CellValue"]))

    # === PIED DE PAGE ===
    elements.append(Spacer(1, 30))
    elements.append(HRFlowable(width="100%", thickness=1, color=OLIVE, spaceAfter=8))
    elements.append(Paragraph(
        f"Document généré le {datetime.now().strftime('%d/%m/%Y à %H:%M')} — Portail Athénée Royal de Comines",
        styles["Footer"]
    ))

    doc.build(elements)
    buffer.seek(0)

    filename = f"intervention_{intervention.id}_{datetime.now().strftime('%Y%m%d')}.pdf"
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )