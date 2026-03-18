import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpInterceptorFn} from '@angular/common/http';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})

export class Auth {
  private apiURL = 'http://127.0.0.1:8000/api/v1';
  constructor(private http: HttpClient){}

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
  me(){
    return this.http.get(`${this.apiURL}/auth/me`);
  }
}

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(Auth);
  const token = auth.getToken();

  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(req);
};
