import { Component, OnInit } from '@angular/core';
import { InterventionService } from '../../../../services/intervention.service';
import { UserService } from '../../../../services/user.service';
import { FormsModule } from '@angular/forms';


import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-supervisor-panel',
  imports: [DatePipe, FormsModule],
  templateUrl: './supervisor-panel.html',
  styleUrl: './supervisor-panel.css',
})
export class SupervisorPanel implements OnInit {


  interventions: any[] = [];
  users: any[] = [];
  selectedUserId: number | null = null;



  constructor(
    private interventionService: InterventionService,
    private userService: UserService
  ) { }

  loadValidatedInterventions(): void {
    this.interventionService.getValidated().subscribe({
      next: (data: any) => {
        this.interventions = data;
      },
      error: (err) => {
        console.log('Erreur', err)
      }
    })
  }


  getAssignableUser(): void {
    this.userService.getAssignableUsers().subscribe({
      next: (data: any) => {
        this.users = data;
      },
      error: (err) => {
        console.log('Erreur', err)
      }
    })
  }
  
  assign(interventionId: number): void {
    if (!this.selectedUserId) return;

    this.interventionService.assign(interventionId, this.selectedUserId).subscribe({
      next: () => {
        this.loadValidatedInterventions();
      }
    })
  }


  ngOnInit(): void {
    this.loadValidatedInterventions();
    this.getAssignableUser();
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