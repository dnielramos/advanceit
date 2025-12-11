// src/app/models/payment.model.ts

/**
 * Representa los posibles estados de un pago.
 */
export type PaymentStatus = 'pendiente' | 'pagado' | 'no_pagado' | 'atrasado';

/**
 * Representa los métodos de pago aceptados.
 */
export type PaymentMethod = 'transferencia' | 'tarjeta' | 'credito';

/**
 * Información del usuario en un pago.
 */
export interface PaymentUserInfo {
  id: string;
  name: string;
  email?: string;
}

/**
 * Información de la empresa en un pago.
 */
export interface PaymentCompanyInfo {
  id: number;
  razon_social: string;
  nit: string;
}

/**
 * Información de la orden asociada al pago.
 */
export interface PaymentOrderInfo {
  id: string;
  numeroOrden: string;
  quotation_id?: string;
  company?: PaymentCompanyInfo;
  user?: PaymentUserInfo;
}

/**
 * Información de auditoría (created_by, updated_by).
 */
export interface AuditUser {
  id: string;
  name: string;
}

/**
 * Representa la entidad principal de un pago con la nueva estructura del backend.
 */
export interface Payment {
  id: string; // UUID
  order_id: string;
  order?: PaymentOrderInfo; // 🆕 Datos poblados de la orden
  monto: number;
  fechaLimitePago: string; // formato YYYY-MM-DD o ISO
  metodo: PaymentMethod;
  estado: PaymentStatus;
  created_by?: AuditUser | string; // 🆕 Usuario que creó el pago
  updated_by?: AuditUser | string | null; // 🆕 Usuario que actualizó el pago
  created_at?: string; // 🆕 Fecha de creación ISO
  updated_at?: string; // 🆕 Fecha de actualización ISO
  fechaPago?: string | null; // formato YYYY-MM-DD o ISO
  comprobante?: string; // Base64 del comprobante
}

// --- DTOs (Data Transfer Objects) para las peticiones ---

/**
 * Datos necesarios para crear un nuevo pago.
 * Corresponde al `CreatePaymentDto` del backend.
 */
export interface CreatePaymentPayload {
  order_id: string;
  monto: number;
  fechaLimitePago: string;
  metodo: PaymentMethod;
  user_id: string; // 🆕 REQUERIDO: ID del usuario que crea
}

/**
 * Datos para actualizar el estado de un pago.
 * Corresponde al `UpdateStatusDto` del backend.
 */
export interface UpdateStatusPayload {
  estado: PaymentStatus;
  user_id: string; // 🆕 REQUERIDO: ID del usuario que actualiza
}

/**
 * Datos para actualizar la fecha de pago.
 * Corresponde al `UpdateDateDto` del backend.
 */
export interface UpdateDatePayload {
  fechaPago: string; // YYYY-MM-DD
  user_id: string; // 🆕 REQUERIDO: ID del usuario que actualiza
}

// --- Helpers ---

/**
 * Helper para obtener el nombre del usuario de auditoría.
 */
export function getAuditUserName(user: AuditUser | string | undefined | null): string {
  if (!user) return 'Desconocido';
  if (typeof user === 'string') return user;
  return user.name;
}
