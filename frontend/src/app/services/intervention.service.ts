import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Intervention } from "../pages/interfaces/intervention.model";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class InterventionService {
  private apiURL = 'http://127.0.0.1:8000/api/v1/interventions';
  

  constructor(private http: HttpClient) { }

  getMine() {
    return this.http.get<Intervention[]>(`${this.apiURL}/mine`);
  }

  create(data: any) {
    return this.http.post(`${this.apiURL}`, data);
  }

  getAll() {
    return this.http.get<Intervention[]>(`${this.apiURL}/all`);
  }

  validate(id: number) {
    return this.http.patch<Intervention[]>(`${this.apiURL}/${id}/validate`, {});
  }

  reject(id: number) {
    return this.http.patch(`${this.apiURL}/${id}/rejected`, {});
  }

  assign(id: number, assigneeId: number) {
    return this.http.patch(`${this.apiURL}/${id}/assign`, {assignee_id : assigneeId});
  }

  closedIntervention(id: number) {
    return this.http.patch<Intervention>(`${this.apiURL}/${id}/closed`, {});
  }

  getPending() {
    return this.http.get<Intervention[]>(`${this.apiURL}/pending`);
  }

  getValidated(skip: number, limit: number): Observable<Intervention[]> {
    return this.http.get<Intervention[]>(`${this.apiURL}/validated?skip=${skip}&limit=${limit}`);
  }

  processingIntervention(id: number) {
    return this.http.patch<Intervention>(`${this.apiURL}/${id}/processing`, {});
  }

  getAssigned(skip: number, limit: number): Observable<Intervention[]> {
    return this.http.get<Intervention[]>(`${this.apiURL}/assigned?skip=${skip}&limit=${limit}`);
  }

  getProcessing() {
    return this.http.get<Intervention[]>(`${this.apiURL}/processing`);
  }

  getClosed(skip: number, limit: number): Observable<Intervention[]> {
    return this.http.get<Intervention[]>(`${this.apiURL}/closed?skip=${skip}&limit=${limit}`);
  }
  
}