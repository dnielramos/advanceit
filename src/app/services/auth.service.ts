import { Injectable, inject } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

export enum Role {
  User = 'user',
  Admin = 'admin',
  Cashier = 'cashier',
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

  // Inyección de dependencias moderna
  private http = inject(HttpClient);
  private router = inject(Router);

  // URL del endpoint para validar el token
  private readonly validationUrl = 'http://localhost:3002/auth/profile'; // <-- ¡Verifica tu puerto!

  constructor() {
    this.loadTokenOnStart();
  }

  private loadTokenOnStart(): void {
    const token = this.getToken();
    if (token) {
      // No confíes en el token, valídalo con el backend
      this.validateToken().subscribe();
    }
  }

  /**
   * El método clave: valida el token contra el backend.
   * @returns Observable<boolean> - true si es válido, false si no.
   */
  validateToken(): Observable<boolean> {
    const token = this.getToken();
    if (!token) {
      return of(false); // Si no hay token, no es válido.
    }

    // El interceptor añadirá el token a esta llamada automáticamente
    return this.http.get<JwtPayload>(this.validationUrl).pipe(
      map((response) => {
        // Si la llamada es exitosa (status 200), el token es válido.
        // Actualizamos el rol con la información fresca del backend.
        this.currentUserRole.next(response.role);
        return true;
      }),
      catchError((error) => {
        // Si la llamada falla (status 401), el token es inválido.
        console.error('La validación del token falló', error);
        this.logout(); // Limpia el token inválido
        this.router.navigate(['/in']); // Redirige al login
        return of(false);
      })
    );
  }

  handleLogin(token: string): void {
    localStorage.setItem('adtkn', token);
    this.decodeAndStoreToken(token);
  }

  logout(): void {
    localStorage.removeItem('adtkn');
    this.currentUserRole.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('adtkn');
  }

  private decodeAndStoreToken(token: string): void {
    try {
      const decodedToken = jwtDecode<JwtPayload>(token);
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
