import { Component, OnInit } from '@angular/core';
import { InterventionService } from '../../../../services/intervention.service';
import { DatePipe, CommonModule } from '@angular/common';


@Component({
  selector: 'app-technician-panel',
  imports: [DatePipe, CommonModule],
  templateUrl: './technician-panel.html',
  styleUrl: './technician-panel.css',
})
export class TechnicianPanel implements OnInit{

interventionsAssigned: any[] = [];
interventionsProcessing: any[] = [];
interventionsClosed: any[] = [];

constructor(
    private interventionService: InterventionService  ) { }

getAssigned(): void{
  this.interventionService.getAssigned().subscribe({
    next: (data: any) => {
        this.interventionsAssigned = data;
      },
      error: (err) => {
        console.error('Erreur', err)
      }
  })
}

processingIntervention(id: number): void{
  this.interventionService.processingIntervention(id).subscribe({
    next: (data: any) => {
        this.getProcessing()
      },
      error: (err) => {
        console.error('Erreur', err)
      }
  })
}

getProcessing(): void{
  this.interventionService.getProcessing().subscribe({
    next: (data: any) => {
        this.interventionsProcessing = data;
      },
      error: (err) => {
        console.error('Erreur', err)
      }
  })
}

closeIntervention(id: number): void{
  this.interventionService.closedIntervention(id).subscribe({
    next: (data: any) => {
        this.getAssigned();
        this.getProcessing()
      },
      error: (err) => {
        console.error('Erreur', err)
      }
  })
}

getClosed(): void{
  this.interventionService.getClosed().subscribe({
    next: (data: any) => {
        this.interventionsClosed = data;
      },
      error: (err) => {
        console.error('Erreur', err)
      }
  })
}
ngOnInit(): void {
    this.getAssigned();
    this.getProcessing();
    this.getClosed();
  }
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