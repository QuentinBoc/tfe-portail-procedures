import { Component, OnInit } from '@angular/core';
import { InterventionService } from '../../../../services/intervention.service';
import { UserService } from '../../../../services/user.service';
import { FormsModule } from '@angular/forms';
import { DatePipe, CommonModule } from '@angular/common';
import { Intervention } from '../../../../models/intervention.model';
import { User } from '../../../../models/users.model';

@Component({
  selector: 'app-supervisor-panel',
  imports: [DatePipe, FormsModule, CommonModule],
  templateUrl: './supervisor-panel.html',
  styleUrl: './supervisor-panel.css',
})
export class SupervisorPanel implements OnInit {


  interventionsValidate: Intervention[] = [];
  interventionsAssigned: Intervention[] = [];
  users: User[] = [];
  selectedUserIds: Record<number, number> = {}



  constructor(
    private interventionService: InterventionService,
    private userService: UserService
  ) { }
  /**Récupère les interventions validées */
  getValidated(): void {
    this.interventionService.getValidated().subscribe({
      next: (data: Intervention[]) => {
        this.interventionsValidate = data;
      },
      error: (err) => {
        console.error('Erreur', err)
      }
    })
  }
  /**Récupère les interventions assignées */
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

  /**Récupère les utilisateurs qui peuvent être assignable */
  getAssignableUser(): void {
    this.userService.getAssignableUsers().subscribe({
      next: (data: User[]) => {
        this.users = data;
      },
      error: (err) => {
        console.error('Erreur', err)
      }
    })
  }
  /**Assigne l'intervention à un utilisateur */
  assign(interventionId: number): void {
    const assigneeId = this.selectedUserIds[interventionId];
    if (!assigneeId) return;

    this.interventionService.assign(interventionId, assigneeId).subscribe({
      next: () => {
        this.getValidated();
        this.getAssigned();
      }
    })
  }

  /**Charge les methodes au demarrage du composant */
  ngOnInit(): void {
    this.getValidated();
    this.getAssigned();
    this.getAssignableUser();
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