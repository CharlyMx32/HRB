import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  
  const authToken = inject(AuthService).getToken();

  if (!authToken) {
    return next(req);
  }
  const newReq = req.clone({
    headers: req.headers.append('Authorization', 'Bearer ' + authToken!),
  });
  return next(newReq);
}