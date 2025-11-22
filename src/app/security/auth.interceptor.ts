import {
  HttpErrorResponse,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, throwError } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

// --- URLs que deben ser ignoradas por el interceptor ---
// (Ajusta estas rutas a las de tu API)
const BYPASS_URLS = ['/auth/login', '/auth/refresh'];

// --- Lógica para manejar el estado del refresh fuera de la función ---
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const accessToken = authService.getAccessToken();

  // Si es una ruta de login o refresh, no añadimos el token
  if (isBypassUrl(req.url, BYPASS_URLS)) {
    return next(req);
  }

  // Clona la petición para añadir el token de acceso si existe
  if (accessToken) {
    req = addTokenHeader(req, accessToken);
  }

  return next(req).pipe(
    catchError((error) => {
      // Si el error es 401 Y NO es una ruta de bypass, intentamos refrescar
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        !isBypassUrl(req.url, BYPASS_URLS) // <-- LA VALIDACIÓN CLAVE
      ) {
        return handle401Error(req, next, authService);
      }
      // Para otros errores, simplemente los propagamos
      return throwError(() => error);
    })
  );
};

// --- Función para añadir el header de autorización ---
const addTokenHeader = (request: HttpRequest<any>, token: string) => {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// --- Función para manejar el error 401 y la lógica de refresh ---
// (Esta función es idéntica a la tuya, la lógica aquí es correcta)
const handle401Error = (
  request: HttpRequest<any>,
  next: HttpHandlerFn,
  authService: AuthService
) => {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshToken().pipe(
      switchMap((tokenResponse: any) => {
        isRefreshing = false;
        refreshTokenSubject.next(tokenResponse.access_token);
        // Reintentamos la petición original con el nuevo token
        return next(addTokenHeader(request, tokenResponse.access_token));
      }),
      catchError((err) => {
        isRefreshing = false;
        // Si el refresh token también falla, hacemos logout
        authService.logout();
        return throwError(() => err);
      })
    );
  } else {
    // Si ya se está refrescando, esperamos a que el nuevo token esté disponible
    return refreshTokenSubject.pipe(
      filter((token) => token !== null),
      take(1),
      switchMap((jwt) => next(addTokenHeader(request, jwt!)))
    );
  }
};

// --- Función helper para comprobar si la URL debe ser ignorada ---
const isBypassUrl = (url: string, bypassUrls: string[]): boolean => {
  return bypassUrls.some((bypassUrl) => url.endsWith(bypassUrl));
};
