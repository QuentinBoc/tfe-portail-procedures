import { NotificationModel } from './../pages/interfaces/notification.model';
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";


@Injectable({
  providedIn: 'root',

})

export class NotificationService {
  private apiURL = 'http://127.0.0.1:8000/api/v1';
  private notification$ = new BehaviorSubject<NotificationModel[]>([]);
  public notifications$ = this.notification$.asObservable()
  
  constructor(
    private http: HttpClient) { }

  checkNotifications(): Observable<NotificationModel[]> {
    return this.http.patch<NotificationModel[]>(`${this.apiURL}/check_all_notifications`, {});
  }

  refresh(): void {
    this.http.get<NotificationModel[]>(`${this.apiURL}/notifications`).subscribe({
      next: (data: NotificationModel[]) => {
        this.notification$.next(data)
      },
      error: (err) => {
        console.error('Erreur', err)
      }
    });
  }
  

}