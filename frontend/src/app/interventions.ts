import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root',
})
export class InterventionService {
  private apiURL = 'http://127.0.0.1:8000/api/v1/interventions';
  
  constructor(private http: HttpClient) {}

  getMine() {
    return this.http.get(`${this.apiURL}/mine`);
  }

  create(data: any) {
    return this.http.post(`${this.apiURL}`, data);
  }

  getAll() {
    return this.http.get(`${this.apiURL}/all`);
  }

  validate(id: number) {
    return this.http.patch(`${this.apiURL}/${id}/validate`, {});
}

  reject(id: number) {
      return this.http.patch(`${this.apiURL}/${id}/rejected`, {});
  }

  getPending() {
    return this.http.get(`${this.apiURL}/pending`);
}
}