import { Component, OnInit } from '@angular/core';
import { InterventionService } from '../../../../services/intervention.service';
import { DatePipe, CommonModule } from '@angular/common';
import { Intervention } from '../../../../models/intervention.model';


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
  /**Charge les methodes au demarrage du composant */
  ngOnInit(): void {
    this.getAssigned();
    this.getProcessing();
    this.getClosed();
  }
  /**Applique un style selon statut */
  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'VALIDATED': 'bg-blue-100 text-blue-800',
      'ASSIGNED': 'bg-indigo-100 text-indigo-800',
      'PROCESSING': 'bg-purple-100 text-purple-800',
      'CLOSED': 'bg-green-100 text-green-800',
      'REJECTED': 'bg-red-100 text-red-800',
    };
    return classes[status] ?? 'bg-gray-100 text-gray-800';
  }
}