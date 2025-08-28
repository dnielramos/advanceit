import { Role } from "../services/auth.service";

// src/app/models/user.model.ts
export interface User {
  id: string;
  name: string;      // Cambiado de 'nombre' a 'name'
  email: string;
  address?: string;
  country?: string;
  city?: string;
  company?: string;
  picture?: string;
  type?: 'admin' | 'cashier' | 'user';
  telephone?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
