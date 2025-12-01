// src/app/services/users.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Role } from './auth.service';
import { ENVIRONMENT } from '../../enviroments/enviroment';
import { User, UserPopulated } from '../models/user';

// DTOs (Data Transfer Objects) para tipar las peticiones
export interface CreateUserDto {
  name: string;
  email: string;
  password?: string;
  role?: Role; 
  address?: string;
  country?: string;
  city?: string;
  company?: string;
  picture?: string;
  type?: Role;
  telephone?: string;
}

export interface UpdateUserDto {
  name?: string;
  address?: string;
  country?: string;
  city?: string;
  company?: string;
  picture?: string;
  type?: Role;
  telephone?: string;
}

export interface UpdatePasswordDto {
  newPassword: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private apiUrl = `${ENVIRONMENT.apiUrl}/users`;

  constructor(private http: HttpClient) { }

  /**
   * Crea un nuevo usuario.
   * @param user El objeto de usuario a crear.
   * @returns Un Observable con la respuesta del servidor.
   */
  createUser(user: CreateUserDto): Observable<any> {
    return this.http.post(this.apiUrl, user);
  }

  /**
   * Obtiene la lista de usuarios.
   * Por defecto el backend devuelve solo usuarios activos, pero puede estar
   * configurado para incluir inactivos según la implementación.
   */
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  /**
   * Crea un usuario usando el endpoint /users/payload
   */
  createUserWithPayload(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/payload`, { data });
  }

  /**
   * Obtiene un usuario por su ID.
   * @param id El ID del usuario.
   * @returns Un Observable con el usuario encontrado.
   */
  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  /**
   * Obtiene un usuario "populado" por su ID, incluyendo la información
   * de la empresa (company: { id, name }).
   * Este método se usa en vistas de detalle (perfil), sin afectar
   * la lógica existente que espera solo el ID de company.
   */
  getUserByIdPopulated(id: string): Observable<UserPopulated> {
    return this.http.get<UserPopulated>(`${this.apiUrl}/${id}`);
  }

  /**
   * Actualiza un usuario por su ID.
   * @param id El ID del usuario.
   * @param updates Los datos a actualizar.
   * @returns Un Observable con el usuario actualizado.
   */
  updateUser(id: string, updates: UpdateUserDto): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, updates);
  }

  /**
   * Actualiza la contraseña de un usuario.
   * @param id El ID del usuario.
   * @param newPassword La nueva contraseña.
   * @returns Un Observable con la respuesta del servidor.
   */
  updatePassword(id: string, newPassword: UpdatePasswordDto): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/password`, newPassword);
  }

  /**
   * Realiza un soft delete de un usuario (status = 'INACTIVE').
   * @param id ID del usuario a desactivar.
   */
  softDeleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  /**
   * Reactiva un usuario previamente inactivo (status = 'ACTIVE').
   * @param id ID del usuario a reactivar.
   */
  reactivateUser(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/reactivate`, {});
  }

  /**
   * Obtiene el rol de un usuario por su ID.
   * @param id El ID del usuario.
   * @returns Un Observable con el rol del usuario.
   */
  getUserRole(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}/role`);
  }
}
