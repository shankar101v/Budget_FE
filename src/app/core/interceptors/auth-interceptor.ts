import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

import { catchError, throwError } from 'rxjs';

import { Auth } from '../auth/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const authService = inject(Auth);
  const router = inject(Router);


  // Login and register do not need JWT
  if (
    req.url.includes('/api/auth/login') ||
    req.url.includes('/api/auth/register')
  ) {
    return next(req);
  }


  const token = authService.getToken();


  // No token available
  if (!token) {
    return next(req);
  }


  // Add JWT
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });


  return next(authReq).pipe(

    catchError((error) => {

      if (error.status === 401) {

        console.log('Session expired. Logging out.');

        authService.logout();

        router.navigate(['/login']);

      }

      return throwError(() => error);

    })

  );
};