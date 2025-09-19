import { Injectable, inject } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
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

  // <-- MODIFICADO: `isLoggedIn$` ahora se deriva de `currentUserRole$`
  // Esto asegura que el estado de login es SIEMPRE consistente con el rol.
  public isLoggedIn$: Observable<boolean>;

  public activeUser$: Observable<string> = of('');

  // Inyección de dependencias moderna
  private http = inject(HttpClient);
  private router = inject(Router);

  // URL del endpoint para validar el token
  private baseURL = 'https://advance-genai.onrender.com';
  private readonly validationUrl = `${this.baseURL}/auth/profile`;

  constructor() {
    // <-- AÑADIDO: Se crea el observable derivado en el constructor.
    this.isLoggedIn$ = this.currentUserRole$.pipe(
      map((role) => role !== null) // Si hay rol, está logueado (true), si es null, no lo está (false).
    );

    this.loadTokenOnStart();
  }

  private loadTokenOnStart(): void {
    const token = this.getToken();
    if (token) {
      // Al validar, se actualizará `currentUserRole`, y `isLoggedIn$` reaccionará automáticamente.
      this.validateToken().subscribe();
    } else {
      // Si no hay token al inicio, nos aseguramos de que el estado sea `null`.
      this.currentUserRole.next(null);
    }
  }

  validateToken(): Observable<boolean> {
    const token = this.getToken();
    if (!token) {
      this.currentUserRole.next(null); // Asegura que el estado de rol sea nulo
      return of(false);
    }

    return this.http.get<JwtPayload>(this.validationUrl).pipe(
      map((response) => {
        // Al actualizar el rol, `isLoggedIn$` emitirá `true` automáticamente.
        this.currentUserRole.next(response.role);
        return true;
      }),
      catchError((error) => {
        console.error('La validación del token falló', error);
        this.logout(); // Logout limpiará el rol, y `isLoggedIn$` emitirá `false`.
        this.router.navigate(['/in']);
        return of(false);
      })
    );
  }

  getUserId(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decoded: any = jwtDecode(token);
      return decoded.sub || decoded.userId || null;
    } catch (e) {
      return null;
    }
  }

  getCurrentUserRole(): Role | null {
    return this.currentUserRole.getValue();
  }

  getToken(): string | null {
    return localStorage.getItem('adtkn');
  }

  handleLogin(token: string): void {
    localStorage.setItem('adtkn', token);
    // Al decodificar y establecer el rol, `isLoggedIn$` emitirá `true` automáticamente.
    this.decodeAndStoreToken(token);
  }

  logout(): void {
    localStorage.removeItem('adtkn');
    // Al poner el rol en `null`, `isLoggedIn$` emitirá `false` automáticamente.
    this.currentUserRole.next(null);
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
