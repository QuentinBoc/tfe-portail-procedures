import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { User, UserCreateAdmin } from "../pages/interfaces/users.model";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiURL = 'http://127.0.0.1:8000/api/v1/users';

  constructor(private http: HttpClient) { }


  getAssignableUsers() {
    return this.http.get<User[]>(`${this.apiURL}/assignableUsers`);
  }

  getAllUsers() {
    return this.http.get<User[]>(`${this.apiURL}/all`);
  }

  createUser(payload: UserCreateAdmin) {
    return this.http.post<User>(`${this.apiURL}/admin/create`, payload);
  }

  updateRole(id: number, roleId: number): Observable<User> {
    return this.http.patch<User>(`${this.apiURL}/${id}/role`, {role_id: roleId});
  }

  deactivateUser(id: number): Observable<User>  {
    return this.http.patch<User>(`${this.apiURL}/${id}/deactivate`, {});
  }
}