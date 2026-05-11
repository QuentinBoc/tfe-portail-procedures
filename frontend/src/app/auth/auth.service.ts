import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpInterceptorFn} from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { User } from '../pages/interfaces/users.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',

})

export class AuthService {
  private apiURL = 'http://127.0.0.1:8000/api/v1';
  constructor(
    private http: HttpClient,
    private router: Router,){}

  login(email: string, password: string){
    return this.http
      .post<{access_token: string}>(
      `${this.apiURL}/auth/login`,
      {email, password}
    )
    .pipe(
      tap((res) => {
        localStorage.setItem('access_token', res.access_token);
      })
    );
  }
  getToken(): string | null{
    return localStorage.getItem('access_token');
  }
  me(): Observable<User>{
    return this.http.get<User>(`${this.apiURL}/auth/me`);
  }

  logout(): void{
    localStorage.removeItem('access_token');
    this.router.navigate(['login']);
  }

  register(email: string, full_name: string, password: string): Observable<User>{
    return this.http
    .post<User>(`${this.apiURL}/users/register`,
      {email, full_name, password}
    )
  }
}

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getToken();

  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(req);
};
