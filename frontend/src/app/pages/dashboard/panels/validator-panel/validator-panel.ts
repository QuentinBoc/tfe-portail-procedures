import { Component, OnInit } from '@angular/core';
import { InterventionService } from '../../../../services/intervention.service';
import { DatePipe, NgClass } from '@angular/common';
import { Intervention } from '../../../interfaces/intervention.model';
import { IStatusInfo } from '../../../interfaces/ilabel';
import { NotificationService } from '../../../../services/notification.service';
import { InterventionReport } from '../../../interfaces/report.model';
import { ReportService } from '../../../../services/report.service';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';


@Component({
  selector: 'app-validator-panel',
  imports: [DatePipe, NgClass, ReactiveFormsModule, FormsModule],
  templateUrl: './validator-panel.html',
  styleUrl: './validator-panel.css',

})
export class ValidatorPanel implements OnInit {
  interventions: Intervention[] = [];
  selectedIntervention: Intervention | null = null;
  interventionsValidated: Intervention[] = [];
  skip: number = 0;
  limit: number = 5;
  reportFormId: number | null = null;
  reportDescription: string = '';
  reportType: 'refusal' | null = null;
  reports: Record<number, InterventionReport[]> = {}


  constructor(
    private interventionService: InterventionService,
    private notificationService: NotificationService,
    private reportService: ReportService,
  ) { }
  /**Charge les interventions en attentes */
  loadPendingInterventions(): void {
    this.interventionService.getPending().subscribe({
      next: (data: Intervention[]) => {
        const oldLength = this.interventions.length
        this.interventions = data;
        const newLength = this.interventions.length
        if (oldLength !== newLength)
          this.notificationService.refresh()
      },
      error: (err) => {
        console.error('Erreur', err)
      }
    })
  }

  /**Valide une intervention et recharge les interventions en attente puis recharge interventions validées */
  validate(id: number): void {
    this.interventionService.validate(id).subscribe({
      next: () => {
        this.loadPendingInterventions();
        this.getValidated();
      }
    })
  }
  /**Rejète une intervention */
  reject(id: number): void {
    this.interventionService.reject(id).subscribe({
      next: () => {
        this.loadPendingInterventions();
      }
    })
  }
  /**Confirmation de rejet d'une intervention */
  onConfirmReject(id: number): void {
    if (confirm('Etes-vous certain de vouloir rejeter cette intervention ?')) {
      this.reject(id);
    }
  }

  /** Récupère les interventions assignées */
  getValidated(): void {
    this.interventionService.getValidated(this.skip, this.limit).subscribe({
      next: (data: Intervention[]) => {
        this.interventionsValidated = data;
      },
      error: (err) => {
        console.error('Erreur', err);
      }
    });
  }

  /** Extention des cartes interventions en accordéon */
  expandedId: number | null = null
  toggleDetails(id: number) {
    if (this.expandedId === id) {
      this.expandedId = null
    } else {
      this.expandedId = id,
        this.reportService.getReports(id).subscribe({
          next: (data) => {
            this.reports[id] = data
          }
        })
    }
  }
  /**Charge les methodes au démarrage */
  ngOnInit(): void {
    this.loadPendingInterventions(),
      this.getValidated()
  }
  /** Retourne le label français et la classe CSS selon le statut */
  getStatusClass(status: string): IStatusInfo {
    const classes: Record<string, IStatusInfo> = {
      'PENDING': { label: 'En attente', cssClass: 'text-yellow-500 bg-yellow-100/60 dark:bg-gray-800' },
      'VALIDATED': { label: 'Validée par direction', cssClass: 'text-blue-500 bg-blue-100/60 dark:bg-gray-800' },
      'ASSIGNED': { label: 'Assignée au technicien', cssClass: 'text-indigo-500 bg-indigo-100/60 dark:bg-gray-800' },
      'PROCESSING': { label: 'Intervention en cours', cssClass: 'text-purple-500 bg-purple-100/60 dark:bg-gray-800' },
      'CLOSED': { label: 'Intervention clôturée', cssClass: 'text-emerald-500 bg-emerald-100/60 dark:bg-gray-800' },
      'REJECTED': { label: 'Intervention rejetée', cssClass: 'text-red-500 bg-red-100/60 dark:bg-gray-800' },
    };
    return classes[status] ?? { label: 'Statut inconnu', cssClass: 'text-gray-500 bg-gray-100/60 dark:bg-gray-800' };
  }

  /** Sélectionne une intervention pour afficher ses détails */
  selectIntervention(intervention: Intervention): void {
    this.selectedIntervention = intervention;
  }

  /** Retourne la classe CSS de la barre de progression selon le statut */
  getProgressWidth(status: string): string {
    const classes: Record<string, string> = {
      'PENDING': 'bg-blue-500 w-1/5 h-1.5',
      'VALIDATED': 'bg-blue-500 w-2/5 h-1.5',
      'ASSIGNED': 'bg-blue-500 w-3/5 h-1.5',
      'PROCESSING': 'bg-blue-500 w-4/5 h-1.5',
      'CLOSED': 'bg-emerald-500 w-full h-1.5',
      'REJECTED': 'bg-red-500 w-full h-1.5',
    };
    return classes[status] ?? 'bg-yellow-500 w-full h-1.5';
  }
  /** Ferme le panneau de détails */
  closeDetails(): void {
    this.selectedIntervention = null;
  }

  previousPage(): void {
    if (this.skip > 0) {
      this.skip = (this.skip - this.limit);
      this.getValidated();
    }
  }

  nextPage(): void {
    this.skip += this.limit;
    this.getValidated();

  }

  onReportForm(id: number): void {
    if (this.reportFormId === id) {
      this.reportFormId = null
      this.reportDescription = ''
    } else {
      this.reportFormId = id
    }
  }

  submitReport() {
    if (!this.reportFormId) return;

    const submitReport = {
      type: 'refusal' as const,
      description: this.reportDescription,
      intervention_id: this.reportFormId
    }


    this.reportService.addReport(submitReport).subscribe({
      next: (data: InterventionReport) => {
        this.loadPendingInterventions();
        this.getValidated();
        this.reportFormId = null;
        this.reportDescription = ''
      },
      error: (err) => {
        console.error('Erreur', err)
      }
    })
  }

  hideIntervention(id: number): void {
    this.interventionService.hideIntervention(id).subscribe({
      next: () => {
        this.loadPendingInterventions();
        this.getValidated();
      },
      error: (err) => {
        console.error('Erreur', err)
      }
    })
  }

  confirmHide(id: number): void {
    const hasConfirmed = window.confirm('Confirmez-vous la suppression de l\'affichage de cette intervention ?');
    if (hasConfirmed) {
      this.hideIntervention(id);
    }
  }

  downloadPdf(id: number): void {
    this.interventionService.exportPdf(id).subscribe({
        next: (blob) => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `intervention_${id}.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
        },
        error: (err) => {
            console.error('Erreur export PDF', err)
        }
    })
}

}