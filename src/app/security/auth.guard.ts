import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si hay un token, el usuario está autenticado
  if (authService.getToken()) {
    return true;
  }

  // Si no hay token, redirige a la página de login
  router.navigate(['/login']);
  return false;
};
