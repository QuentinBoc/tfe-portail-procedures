import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../../services/user.service';
import { CommonModule, DatePipe } from '@angular/common';
import { User, UserCreateAdmin } from '../../../interfaces/users.model';
import { FormsModule } from '@angular/forms';



@Component({
  selector: 'app-admin-panel',
  imports: [DatePipe, FormsModule, CommonModule],
  templateUrl: './admin-panel.html',
  styleUrl: './admin-panel.css',
})

export class AdminPanel implements OnInit {

  users: User[] = [];
  showCreateForm: boolean = false;
  newUser: UserCreateAdmin = { email: '', full_name: '', password: '', role_id: 1 };
  selectedRoleId: Record<number, number> = {};
  errorMessage: string = '';

  constructor(
    private userService: UserService,
  ) { }
  /**Charge les methodes au demarrage du composant */
  ngOnInit(): void {
    this.allUsers()
  }
  /**Récupère toutes les utilisateurs */
  allUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (data: User[]) => {
        this.users = data;
      },
      error: (err) => {
        console.error('Erreur', err)
      }
    })
  }

  /** Création d'un utilisateur par Admin */
  createUser(): void {
    this.userService.createUser(this.newUser).subscribe({
      next: (data: User) => {
        this.allUsers()
      }, error: (err) => {
        const detail = err.error.detail;
        if (Array.isArray(detail)) {
          this.errorMessage = detail.map((e: any) => e.msg.replace('Value error, ', '')).join(', ');
        } else {
          this.errorMessage = detail;
        }
      }
  })
}

  /** Mise à jour du rôle d'un utilisateur */
  updateRole(id: number): void {
    this.userService.updateRole(id, this.selectedRoleId[id]).subscribe({
      next: (data: User) => {
        this.allUsers()
      }
    })
  }

  /** Désactivation d'un utilisateur */
  deactivateUser(id: number): void {
    this.userService.deactivateUser(id).subscribe({
      next: (data: User) => {
        this.allUsers()
      }
    })
  }

  confirmHide(id: number): void {
    const hasConfirmed = window.confirm('Confirmez-vous la désactivation de l\'utilisateur ?');
    if (hasConfirmed) {
      this.deactivateUser(id);
    }
  }

  getRoleLabel(roleId: number): string {
    const roles: Record<number, string> = {
      1: 'Utilisateur',
      2: 'Technicien',
      3: 'Chef',
      4: 'Direction',
      5: 'Admin'
    };
    return roles[roleId] ?? 'Inconnu';
  }

}