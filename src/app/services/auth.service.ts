// En algún auth.service.ts de Angular
import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { BehaviorSubject } from 'rxjs';

// Define tu enum de roles también en el frontend
export enum Role {
  User = 'user',
  Admin = 'admin',
  Cashier = 'cashier',
}

interface JwtPayload {
  email: string;
  sub: string;
  role: Role;
  // iat y exp son campos estándar de JWT
  iat?: number;
  exp?: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserRole = new BehaviorSubject<Role | null>(null);
  public currentUserRole$ = this.currentUserRole.asObservable();

  constructor() {
    // Al iniciar el servicio, intenta cargar el token desde localStorage
    const token = this.getToken();
    if (token) {
      this.decodeAndStoreToken(token);
    }
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

  // Llama a este método después de un login exitoso
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

  // Método de conveniencia para usar en la UI
  hasRole(requiredRole: Role | Role[]): boolean {
    const currentRole = this.currentUserRole.getValue();
    if (!currentRole) {
      return false;
    }

    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(currentRole);
    }

    return currentRole === requiredRole;
  }
}
