 import { Role } from "../services/auth.service";

 // src/app/models/user.model.ts
 export interface User {
   id: string;
   name: string; 
   email: string;
   address?: string;
   country?: string;
   city?: string;
   company?: string;
   picture?: string;
   type?: Role;
   telephone?: string;
   status?: 'ACTIVE' | 'INACTIVE';
   createdAt?: Date;
   updatedAt?: Date;
 }


 export interface UserPopulated {
  id: string;
  name: string; 
  email: string;
  address?: string;
  country?: string;
  city?: string;
  picture?: string;
  type?: Role;
  telephone?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  createdAt?: Date;
  updatedAt?: Date;
  company: {
    id: string;
    name: string;
  };
 }
