import { Component, OnInit } from '@angular/core';
import { InterventionService } from '../../../../services/intervention.service';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-validator-panel',
  imports: [DatePipe],
  templateUrl: './validator-panel.html',
  styleUrl: './validator-panel.css',
})
export class ValidatorPanel implements OnInit {
  interventions: any[] = [];

  constructor(
    private interventionService: InterventionService,
  ) { }

  loadPendingInterventions(): void {
    this.interventionService.getPending().subscribe({
      next: (data: any) => {
        this.interventions = data;
      },
      error: (err) => {
        console.log('Erreur', err)
      }
    })
  }

  validate(id: number): void {
    this.interventionService.validate(id).subscribe({
      next: () => {
        this.loadPendingInterventions();
      }
    })
  }
  reject(id: number): void {
    this.interventionService.reject(id).subscribe({
      next: () => {
        this.loadPendingInterventions();
      }
    })
  }

  ngOnInit(): void {
    this.loadPendingInterventions()
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

