import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ReportService } from './../../../../services/report.service';
import { Component, OnInit } from '@angular/core';
import { InterventionService } from '../../../../services/intervention.service';
import { DatePipe, CommonModule } from '@angular/common';
import { Intervention } from '../../../interfaces/intervention.model';
import { IStatusInfo } from '../../../interfaces/ilabel';
import { NotificationService } from '../../../../services/notification.service';
import { InterventionReport } from '../../../interfaces/report.model';



@Component({
  selector: 'app-technician-panel',
  imports: [DatePipe, CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './technician-panel.html',
  styleUrl: './technician-panel.css',
})
export class TechnicianPanel implements OnInit {

  interventionsAssigned: Intervention[] = [];
  interventionsProcessing: Intervention[] = [];
  interventionsClosed: Intervention[] = [];
  skip: number = 0;
  limit: number = 5;
  reportFormId: number | null = null;
  reportDescription: string = '';
  reportType: 'closure' | 'problem' | null = null;
  problemIds: Set<number> = new Set();
  reports: Record<number, InterventionReport[]> = {};

  

  constructor(
    private interventionService: InterventionService,
    private notificationService: NotificationService,
    private reportService: ReportService) { }
  /**Récupère les intervention assignées */
  getAssigned(): void {
    this.interventionService.getAssigned(this.skip, this.limit).subscribe({
      next: (data: Intervention[]) => {
        const oldLength = this.interventionsAssigned.length
        this.interventionsAssigned = data;
        const newLength = this.interventionsAssigned.length
        if (oldLength !== newLength)
          this.notificationService.refresh()
      },
      error: (err) => {
        console.error('Erreur', err)
      }
    })
  }
  /**Déclenchement de transition de Assigned vers Processing */
  processingIntervention(id: number): void {
    this.interventionService.processingIntervention(id).subscribe({
      next: (data: Intervention) => {
        this.getProcessing();
        this.getAssigned();
      },
      error: (err) => {
        console.error('Erreur', err)
      }
    })
  }
  /**Récupère une intervention en cours de traitement + celles avec signalement*/
  getProcessing(): void {
    this.interventionService.getProcessing().subscribe({
      next: (data: Intervention[]) => {
        const oldLength = this.interventionsProcessing.length
        this.interventionsProcessing = data;
        const newLength = this.interventionsProcessing.length
        if (oldLength !== newLength)
          this.notificationService.refresh()
        
        this.problemIds.clear();
        data.forEach(intervention => {
          this.reportService.getReports(intervention.id).subscribe({
            next: (reports) => {
              this.reports[intervention.id] = reports;
              if (reports.some(r => r.type === 'problem')) {
                this.problemIds.add(intervention.id);
              }
            }
          });
        });
      },
      error: (err) => {
        console.error('Erreur', err)
      }
    })
}

  /**Ferme une intervention*/
  closeIntervention(id: number): void {
    this.interventionService.closedIntervention(id).subscribe({
      next: (data: Intervention) => {
        this.getProcessing();
      },
      error: (err) => {
        console.error('Erreur', err)
      }
    })
  }
  /**Récupère les interventions fermées*/
  getClosed(): void {
    this.interventionService.getClosed(this.skip, this.limit).subscribe({
      next: (data: Intervention[]) => {
        this.interventionsClosed = data;
      },
      error: (err) => {
        console.error('Erreur', err)
      }
    })
  }

  /** Extention des cartes interventions en accordéon */
  expandedId: number | null = null
  toggleDetails(id: number) {
    console.log('toggle', id, 'current:', this.expandedId);
    if (this.expandedId === id) {
      this.expandedId = null
    } else {
      this.expandedId = id
    }
}

  /**Charge les methodes au demarrage du composant */
  ngOnInit(): void {
    this.getAssigned();
    this.getProcessing();
    this.getClosed();
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
  previousPage(): void {
    if (this.skip > 0) {
      this.skip = (this.skip - this.limit);
      this.getClosed();
    }
  }

  nextPage(): void {
    this.skip += this.limit;
    this.getClosed();

  }

  onReportForm(id: number, type: 'closure' | 'problem'): void {
    if (this.reportFormId === id) {
      this.reportFormId = null
      this.reportDescription = ''
    } else {
      this.reportFormId = id
      this.reportType = type
    }
  }

  submitReport() {
    if (!this.reportFormId || !this.reportType) return;

    const submitReport = {
      type: this.reportType,
      description: this.reportDescription,
      intervention_id: this.reportFormId
    }

    this.reportService.addReport(submitReport).subscribe({
      next: (data: InterventionReport) => {
        this.getProcessing();
        this.getClosed();
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
        this.getProcessing();
        this.getClosed();
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

  getCardClass(id: number): string {
    return this.expandedId === id
      ? 'bg-[#e8f0ef] border-[#416F6F] border-l-4 border-l-[#3E5153]'
      : this.problemIds.has(id)
        ? 'bg-red-50 border-red-400 border-l-4 border-l-red-500'
        : 'bg-white border-[#9D9E81]/40 hover:bg-[#fdf8f2]';
  }

  getExpandClass(id: number): string {
    return this.expandedId === id ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]';
  }

  

}