import { Component, OnInit } from '@angular/core';
import { InterventionService } from '../../../../services/intervention.service';
import { DatePipe } from '@angular/common';



@Component({
  selector: 'app-admin-panel',
  imports: [DatePipe],
  templateUrl: './admin-panel.html',
  styleUrl: './admin-panel.css',
})

export class AdminPanel implements OnInit{

  interventions: any[] = [];

  constructor(
    private interventionService: InterventionService,
  ) {}

  ngOnInit(): void {
    this.allInterventions()
  }
  
  allInterventions(): void {
    this.interventionService.getAll().subscribe({
      next: (data: any) => {
        this.interventions = data;
      },
      error: (err) => {
        console.log('Erreur', err)
      }
    })
  }
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
