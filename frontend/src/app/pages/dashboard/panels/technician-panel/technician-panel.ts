import { Component, OnInit } from '@angular/core';
import { InterventionService } from '../../../../services/intervention.service';
import { DatePipe, CommonModule } from '@angular/common';
import { Intervention } from '../../../interfaces/intervention.model';
import { IStatusInfo } from '../../../interfaces/ilabel';


@Component({
  selector: 'app-technician-panel',
  imports: [DatePipe, CommonModule],
  templateUrl: './technician-panel.html',
  styleUrl: './technician-panel.css',
})
export class TechnicianPanel implements OnInit {

  interventionsAssigned: Intervention[] = [];
  interventionsProcessing: Intervention[] = [];
  interventionsClosed: Intervention[] = [];

  constructor(
    private interventionService: InterventionService) { }
    /**Récupère les intervention assignées */
  getAssigned(): void {
    this.interventionService.getAssigned().subscribe({
      next: (data: Intervention[]) => {
        this.interventionsAssigned = data;
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
  /**Récupère une intervention en cours de traitement */
  getProcessing(): void {
    this.interventionService.getProcessing().subscribe({
      next: (data: Intervention[]) => {
        this.interventionsProcessing = data;
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
    this.interventionService.getClosed().subscribe({
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
  toggleDetails(id: number){
    if (this.expandedId === id){
      this.expandedId = null
    }else{
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
        'PENDING':    { label: 'En attente',             cssClass: 'text-yellow-500 bg-yellow-100/60 dark:bg-gray-800' },
        'VALIDATED':  { label: 'Validée par direction',  cssClass: 'text-blue-500 bg-blue-100/60 dark:bg-gray-800' },
        'ASSIGNED':   { label: 'Assignée au technicien',  cssClass: 'text-indigo-500 bg-indigo-100/60 dark:bg-gray-800' },
        'PROCESSING': { label: 'Intervention en cours',   cssClass: 'text-purple-500 bg-purple-100/60 dark:bg-gray-800' },
        'CLOSED':     { label: 'Intervention clôturée',   cssClass: 'text-emerald-500 bg-emerald-100/60 dark:bg-gray-800' },
        'REJECTED':   { label: 'Intervention rejetée',    cssClass: 'text-red-500 bg-red-100/60 dark:bg-gray-800' },
      };
      return classes[status] ?? { label: 'Statut inconnu', cssClass: 'text-gray-500 bg-gray-100/60 dark:bg-gray-800' };
    }
}