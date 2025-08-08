import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);

  // El guardia ahora devuelve el Observable<boolean> directamente.
  // El enrutador de Angular esperará a que se resuelva.
  // Si emite `true`, la navegación continúa.
  // Si emite `false`, la navegación se cancela (y el servicio ya se encargó de redirigir).
  return authService.validateToken();
};
