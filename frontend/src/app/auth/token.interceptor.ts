import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { Auth } from './auth';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';


export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(Auth);
  const token = auth.getToken();
  const router = inject(Router);
  
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(req).pipe(
    catchError((error) => {
        if (error.status === 401) {
            router.navigate(['/login']);
        }
        return throwError(() => error);
    })
);
};