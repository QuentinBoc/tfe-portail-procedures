import { Component, OnInit } from '@angular/core';
import { InterventionService } from '../../../../services/intervention.service';
import { DatePipe } from '@angular/common';
import { Intervention } from '../../../../models/intervention.model';



@Component({
  selector: 'app-admin-panel',
  imports: [DatePipe],
  templateUrl: './admin-panel.html',
  styleUrl: './admin-panel.css',
})

export class AdminPanel implements OnInit{

  interventions: Intervention[] = [];

  constructor(
    private interventionService: InterventionService,
  ) {}
  /**Charge les methodes au demarrage du composant */
  ngOnInit(): void {
    this.allInterventions()
  }
  /**Récupère toutes les interventions */
  allInterventions(): void {
    this.interventionService.getAll().subscribe({
      next: (data: Intervention[]) => {
        this.interventions = data;
      },
      error: (err) => {
        console.error('Erreur', err)
      }
    })
  }
  /**Applique un style selon statut */
  getStatusClass(status: string): string {
  const classes: Record<string, string> = {
    'PENDING':    'bg-yellow-100 text-yellow-800',
    'VALIDATED':  'bg-blue-100 text-blue-800',
    'ASSIGNED':   'bg-indigo-100 text-indigo-800',
    'PROCESSING': 'bg-purple-100 text-purple-800',
    'CLOSED':     'bg-green-100 text-green-800',
    'REJECTED':   'bg-red-100 text-red-800',
  };
  return classes[status] ?? 'bg-gray-100 text-gray-800';
  }
}
