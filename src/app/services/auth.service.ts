import { Injectable, inject } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { ENVIRONMENT } from '../../enviroments/enviroment';
import { UsersService } from './users.service';

export enum Role {
  User = 'user',
  Admin = 'admin',
  Cashier = 'cashier',
  Warehouse = 'warehouse'
}

interface JwtPayload {
  email: string;
  sub: string;
  role: Role;
  iat?: number;
  exp?: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserRole = new BehaviorSubject<Role | null>(null);
  public currentUserRole$ = this.currentUserRole.asObservable();
  public isLoggedIn$: Observable<boolean>;

  private activeUserSubject = new BehaviorSubject<string>('');
  public activeUser$ = this.activeUserSubject.asObservable();

  // Inyección de dependencias moderna
  private http = inject(HttpClient);
  private router = inject(Router);

  // URL del endpoint para validar el token
  private baseURL = ENVIRONMENT.apiUrlRender;
  private readonly validationUrl = `${this.baseURL}/auth/profile`;
   // --- NUEVO: Endpoint de Refresh ---
  private readonly refreshUrl = `${this.baseURL}/auth/refresh`;

  constructor( private userService: UsersService) {
    // <-- AÑADIDO: Se crea el observable derivado en el constructor.
    this.isLoggedIn$ = this.currentUserRole$.pipe(
      map((role) => role !== null) // Si hay rol, está logueado (true), si es null, no lo está (false).
    );

    this.loadTokenOnStart();
  }

  private loadTokenOnStart(): void {
    const token = this.getAccessToken();
    if (token) {
      // Al validar, se actualizará `currentUserRole`, y `isLoggedIn$` reaccionará automáticamente.
      this.validateToken().subscribe({
        next: (isValid) => {
          if (isValid) {
            // Cargar datos del usuario cuando el token es válido
            this.getUserId();
          }
        }
      });
    } else {
      // Si no hay token al inicio, nos aseguramos de que el estado sea `null`.
      this.currentUserRole.next(null);
    }
  }

   // --- MÉTODOS DE TOKENS ACTUALIZADOS ---
  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  validateToken(): Observable<boolean> {
    const token = this.getAccessToken();
    if (!token) {
      this.currentUserRole.next(null); // Asegura que el estado de rol sea nulo
      this.isLoggedIn$ = of(false); // Actualiza el estado de login
      return of(false);
    }

    const handleProfileResponse = (response: JwtPayload): boolean => {
      this.currentUserRole.next(response.role);
      return true;
    };

    return this.http.get<JwtPayload>(this.validationUrl).pipe(
      map(handleProfileResponse),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          return this.refreshToken().pipe(
            switchMap(() => this.http.get<JwtPayload>(this.validationUrl)),
            map(handleProfileResponse),
            catchError((refreshError) => {
              console.error('El refresh token también falló', refreshError);
              this.logout();
              return of(false);
            })
          );
        }

        console.error('La validación del token falló', error);
        this.logout(); // Logout limpiará el rol, y `isLoggedIn$` emitirá `false`.
        return of(false);
      })
    );
  }

  getUserId(): string | null {
    const token = this.getAccessToken();
    if (!token) return null;

    try {
      const decoded: any = jwtDecode(token);
      const userId = decoded.sub || decoded.userId || null;

      if (userId) {
        // Actualiza el BehaviorSubject con el nombre del usuario
        this.userService.getUserById(userId).subscribe({
          next: (user) => this.activeUserSubject.next(user.name),
          error: (err) => console.error('Error loading user name:', err)
        });
      }

      return decoded.sub || decoded.userId || null;
    } catch (e) {
      return null;
    }
  }

  getCurrentUserRole(): Role | null {
    return this.currentUserRole.getValue();
  }

  // getToken(): string | null {
  //   return localStorage.getItem('adtkn');
  // }

  // --- MODIFICADO: handleLogin ahora guarda ambos tokens ---
  handleLogin(tokens: { access_token: string, refresh_token: string }): void {
    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
    this.decodeAndStoreToken(tokens.access_token);
    // Cargar el nombre del usuario después del login
    this.getUserId();
  }

  // --- MODIFICADO: logout borra ambos tokens ---
  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.currentUserRole.next(null);
    this.activeUserSubject.next(''); // Limpiar el nombre del usuario
    this.router.navigate(['/in']); // Redirige al login
  }

   // --- NUEVO: Lógica para refrescar el token ---
  refreshToken(): Observable<{ access_token: string, refresh_token: string }> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error('No refresh token available'));
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${refreshToken}`
    });

    return this.http.post<{ access_token: string, refresh_token: string }>(this.refreshUrl, {}, { headers }).pipe(
      
      tap(tokens => {
        // Guarda el nuevo access token cuando la llamada es exitosa
        localStorage.setItem('access_token', tokens.access_token);
        localStorage.setItem('refresh_token', tokens.refresh_token);
        this.decodeAndStoreToken(tokens.access_token);

        console.log('Token refrescado exitosamente!');
      })
    );
  }


  private decodeAndStoreToken(token: string): void {
    try {
      const decodedToken = jwtDecode<JwtPayload>(token);
      console.log('Token decodificado:', decodedToken);
      this.currentUserRole.next(decodedToken.role);
    } catch (error) {
      console.error('Error decodificando el token', error);
      this.logout();
    }
  }

  hasRole(requiredRole: Role | Role[]): boolean {
    const currentRole = this.currentUserRole.getValue();
    if (!currentRole) return false;
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(currentRole);
    }
    return currentRole === requiredRole;
  }
}
