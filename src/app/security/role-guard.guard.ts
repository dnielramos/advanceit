// En role.guard.ts
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService, Role } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Obtén los roles permitidos desde la data de la ruta
  const expectedRoles = route.data['expectedRoles'] as Role[];

  if (!authService.hasRole(expectedRoles)) {
    // Redirige a una página de 'no autorizado' o a la home
    router.navigate(['/in']);
    return false;
  }

  return true;
};
