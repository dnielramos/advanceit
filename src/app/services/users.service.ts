// src/app/services/users.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Role } from './auth.service';
import { ENVIRONMENT } from '../../enviroments/enviroment';
import { User } from '../models/user';

// DTOs (Data Transfer Objects) para tipar las peticiones
export interface CreateUserDto {
  name: string;
  email: string;
  password?: string;
  role?: Role; // Usa los roles que tienes en tu backend
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
  private apiUrl = `${ENVIRONMENT.apiUrlRender}/users`;

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
   * Obtiene la lista de todos los usuarios.
   * @returns Un Observable con la lista de usuarios.
   */
  getUsers(): Observable<any> {
    return this.http.get(this.apiUrl);
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
   * Obtiene el rol de un usuario por su ID.
   * @param id El ID del usuario.
   * @returns Un Observable con el rol del usuario.
   */
  getUserRole(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}/role`);
  }
}
