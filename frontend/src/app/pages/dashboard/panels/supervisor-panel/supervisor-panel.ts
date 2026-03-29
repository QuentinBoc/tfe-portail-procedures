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
  selectedUserIds: Record<number, number> = {}



  constructor(
    private interventionService: InterventionService,
    private userService: UserService
  ) { }

  getAssigned(): void {
    this.interventionService.getAssigned().subscribe({
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
    const assigneeId = this.selectedUserIds[interventionId];
    if (!assigneeId) return;

    this.interventionService.assign(interventionId, assigneeId).subscribe({
      next: () => {
        this.getAssigned();
      }
    })
  }


  ngOnInit(): void {
    this.getAssigned();
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