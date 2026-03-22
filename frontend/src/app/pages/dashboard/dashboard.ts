import { Component, OnInit } from '@angular/core';
import { AdminPanel } from './panels/admin-panel/admin-panel';
import { ValidatorPanel } from './panels/validator-panel/validator-panel';
import { TechnicianPanel } from './panels/technician-panel/technician-panel';
import { SupervisorPanel } from './panels/supervisor-panel/supervisor-panel';
import { RequesterPanel } from './panels/requester-panel/requester-panel';
import { Auth } from '../../auth/auth';
import { CommonModule } from '@angular/common';

type RoleName = 'Admin' | 'Direction' | 'Technicien' | 'Chef' | 'Utilisateur';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  role: RoleName | null = null;
  roleLabel: string | null = null;
  ActivePanel: any=null;
  
  panelMap: Record<RoleName, any> = {
    Admin: AdminPanel,
    Direction: ValidatorPanel,
    Technicien: TechnicianPanel,
    Chef: SupervisorPanel,
    Utilisateur: RequesterPanel,
  };

  constructor(private auth: Auth) {}

  ngOnInit(): void {
    this.auth.me().subscribe({
      next: (me: any) => {
        this.role = me.role;
        this.roleLabel = me.role_label;
        this.ActivePanel = this.role ? this.panelMap[this.role] : null;
      },
      error: () => {
        this.role = null;
        this.ActivePanel = null;
      }
    })
  }

}

