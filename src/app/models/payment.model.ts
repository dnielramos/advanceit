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
 * Representa la entidad principal de un pago.
 * Omitimos 'comprobante' ya que rara vez se transfiere este Buffer en las respuestas GET.
 */
export interface Payment {
  id: string; // UUID
  order_id: string;
  monto: number;
  fechaLimitePago: string; // formato YYYY-MM-DD
  metodo: PaymentMethod;
  estado: PaymentStatus;
  createdBy?: string;
  fechaPago?: string; // formato YYYY-MM-DD
}

// --- DTOs (Data Transfer Objects) para las peticiones ---

/**
 * Datos necesarios para crear un nuevo pago.
 * Corresponde al `CreatePaymentDto` del backend.
 */
export type CreatePaymentPayload = Omit<Payment, 'id' | 'estado' | 'fechaPago'>;

/**
 * Datos para actualizar el estado de un pago.
 * Corresponde al `UpdateStatusDto` del backend.
 */
export interface UpdateStatusPayload {
  estado: PaymentStatus;
}

/**
 * Datos para actualizar la fecha de pago.
 * Corresponde al `UpdateDateDto` del backend.
 */
export interface UpdateDatePayload {
  fechaPago: string; // YYYY-MM-DD
}