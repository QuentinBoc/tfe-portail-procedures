import { Component, OnInit } from '@angular/core';
import { InterventionService } from '../../../../services/intervention.service';
import { UserService } from '../../../../services/user.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Intervention } from '../../../interfaces/intervention.model';
import { User } from '../../../interfaces/users.model';
import { IStatusInfo } from '../../../interfaces/ilabel';
import { NotificationService } from '../../../../services/notification.service';
import { ReportService } from '../../../../services/report.service';
import { InterventionReport } from '../../../interfaces/report.model';


@Component({
  selector: 'app-supervisor-panel',
  imports: [FormsModule, CommonModule],
  templateUrl: './supervisor-panel.html',
  styleUrl: './supervisor-panel.css',
})
export class SupervisorPanel implements OnInit {
  interventions: Intervention[] = [];
  interventionsValidate: Intervention[] = [];
  interventionsAssigned: Intervention[] = [];
  users: User[] = [];
  selectedUserIds: Record<number, number> = {};
  selectedIntervention: Intervention | null = null;
  skip: number = 0;
  limit: number = 5;
  interventionsToAssign: Intervention[] = [];
  interventionsTracking: Intervention[] = [];
  problemIds: Set<number> = new Set();
  reports: Record<number, InterventionReport[]> = {};

  constructor(
    private interventionService: InterventionService,
    private userService: UserService,
    private notificationService: NotificationService,
    private reportService: ReportService,
  ) { }

  /** Récupère les interventions validées */
  getValidated(): void {
    this.interventionService.getValidated(this.skip, this.limit).subscribe({
      next: (data: Intervention[]) => {
        this.interventionsToAssign = data.filter(i => i.status === 'VALIDATED');
        this.interventionsTracking = data.filter(i => i.status !== 'VALIDATED');
        this.notificationService.refresh();
        
        this.problemIds = new Set();
        this.interventionsTracking.forEach(intervention => {
            this.reportService.getReports(intervention.id).subscribe({
                next: (reports) => {
                    this.reports[intervention.id] = reports;
                    if (reports.some(r => r.type === 'problem')) {
                        this.problemIds = new Set([...this.problemIds, intervention.id]);
                    }
                }
            });
        });
      },
      error: (err) => {
        console.error('Erreur', err);
      }
    });
}

  /** Récupère les interventions assignées */
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
        console.error('Erreur', err);
      }
    });
  }

  /** Récupère les utilisateurs assignables */
  getAssignableUser(): void {
    this.userService.getAssignableUsers().subscribe({
      next: (data: User[]) => {
        this.users = data;
      },
      error: (err) => {
        console.error('Erreur', err);
      }
    });
  }
  /** Extention des cartes interventions en accordéon */
  expandedId: { id: number | null, section: 'validate' | 'assigned' | null } = { id: null, section: null };

  toggleDetails(id: number, section: 'validate' | 'assigned') {
    if (this.expandedId.id === id && this.expandedId.section === section) {
      this.expandedId = { id: null, section: null };
    } else {
      this.expandedId = { id, section };
    }
  }

  /** Assigne l'intervention à un utilisateur */
  assign(interventionId: number): void {
    const assigneeId = this.selectedUserIds[interventionId];
    if (!assigneeId) return;

    this.interventionService.assign(interventionId, assigneeId).subscribe({
      next: () => {
        this.getValidated();
        this.getAssigned();
      }
    });
  }

  /** Charge les données au démarrage du composant */
  ngOnInit(): void {
    this.getValidated();
    this.getAssigned();
    this.getAssignableUser();
  }

  /** Sélectionne une intervention pour afficher ses détails */
  selectIntervention(intervention: Intervention): void {
    this.selectedIntervention = intervention;
  }

  /** Ferme le panneau de détails */
  closeDetails(): void {
    this.selectedIntervention = null;
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

  previousPage(): void {
    if (this.skip > 0) {
      this.skip = (this.skip - this.limit);
      this.getAssigned();
    }
  }

  nextPage(): void {
    this.skip += this.limit;
    this.getAssigned();

  }

  hideIntervention(id: number): void {
    this.interventionService.hideIntervention(id).subscribe({
      next: () => {
        this.getValidated();
        this.getAssigned();
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



reactivateIntervention(id: number): void {
    this.interventionService.reactivateIntervention(id).subscribe({
        next: () => {
            this.getValidated();
            this.getAssigned();
        },
        error: (err) => {
            console.error('Erreur', err)
        }
    })
}

  
}