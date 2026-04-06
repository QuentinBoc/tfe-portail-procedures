import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiURL = 'http://127.0.0.1:8000/api/v1/users';

  constructor(private http: HttpClient) { }


  getAssignableUsers() {

    return this.http.get(`${this.apiURL}/assignableUsers`);
  }

}