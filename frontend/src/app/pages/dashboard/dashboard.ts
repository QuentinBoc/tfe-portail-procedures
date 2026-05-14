import { NotificationModel } from './../interfaces/notification.model';
import { NotificationService } from './../../services/notification.service';
import { AuthService } from './../../auth/auth.service';
import { Component, OnInit } from '@angular/core';
import { AdminPanel } from './panels/admin-panel/admin-panel';
import { ValidatorPanel } from './panels/validator-panel/validator-panel';
import { TechnicianPanel } from './panels/technician-panel/technician-panel';
import { SupervisorPanel } from './panels/supervisor-panel/supervisor-panel';
import { RequesterPanel } from './panels/requester-panel/requester-panel';
import { CommonModule } from '@angular/common';




type RoleName = 'Admin' | 'Direction' | 'Technicien' | 'Chef' | 'Utilisateur';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RequesterPanel, AdminPanel, ValidatorPanel, SupervisorPanel, TechnicianPanel],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',

})
export class Dashboard implements OnInit {
  role: RoleName | null = null;
  roleLabel: string | null = null;
  ActivePanel: any = null;
  isExpanded: boolean = false;
  notifications: NotificationModel[] = [];
  isDropdownOpen: boolean = false;

  toggleSidebar(): void {
    this.isExpanded = !this.isExpanded
  }

  panelMap: Record<RoleName, any> = {
    Admin: AdminPanel,
    Direction: ValidatorPanel,
    Technicien: TechnicianPanel,
    Chef: SupervisorPanel,
    Utilisateur: RequesterPanel,
  };

  constructor(
    private auth: AuthService,
    private notificationService: NotificationService
  ) { }


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
    this.notificationService.notifications$.subscribe({
      next: (data: NotificationModel[]) => {
        this.notifications = data
      },
    })
    this.notificationService.refresh()
  }

  get unreadCount(): number {
    return this.notifications.filter(n => !n.is_read).length
  }


  logout(): void {
    this.auth.logout()
  }

  onBellClick(): void {
    if (!this.isDropdownOpen) {
      this.isDropdownOpen = true
      setTimeout(() => {
        this.notificationService.checkNotifications().subscribe({
          next: () => {
            this.isDropdownOpen = false,
              this.notificationService.refresh()
          }

        })


      }, 3000)
    }

  }



}

