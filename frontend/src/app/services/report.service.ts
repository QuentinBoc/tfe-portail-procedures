import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { NewReport, InterventionReport } from "../pages/interfaces/report.model";


@Injectable({
  providedIn: 'root',

})

export class ReportService {
  private apiURL = 'http://127.0.0.1:8000/api/v1';
  
  
  constructor(
    private http: HttpClient) { }

    getReports(intervention_id: number){
        return this.http.get<InterventionReport[]>(`${this.apiURL}/intervention/${intervention_id}/reports`);
    }

    addReport(data: NewReport){
        return this.http.post<InterventionReport>(`${this.apiURL}/add_report`, data);
    }
}