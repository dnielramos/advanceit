import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  const userId = authService.getUserId(); // <-- nuevo método en el servicio

  if (token) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        'x-user-id': userId ?? ''   // por convención, cabeceras personalizadas con prefijo x-
      }
    });
    return next(clonedReq);
  }

  return next(req);
};
