import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { NotificationModel } from "../pages/interfaces/notification.model";

@Injectable({
  providedIn: 'root',

})

export class NotificationService {
  private apiURL = 'http://127.0.0.1:8000/api/v1';
  constructor(
    private http: HttpClient){}

    getNotifications(): Observable<NotificationModel[]>{
        return this.http.get<NotificationModel[]>(`${this.apiURL}/notifications`);
      }
    
    checkNotifications(): Observable<NotificationModel[]>{
        return this.http.patch<NotificationModel[]>(`${this.apiURL}/check_all_notifications`, {});
    }


}