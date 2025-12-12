// src/app/models/shipping.model.ts

/**
 * Representa los posibles estados de un envío.
 */
export type ShippingStatus =
  | 'preparando'
  | 'en_transito'
  | 'entregado'
  | 'fallido';

/**
 * Representa una empresa asociada a una orden.
 */
export interface ShippingCompany {
  id: number;
  razon_social: string;
  nit: string;
}

/**
 * Representa un usuario asociado a una orden o acción.
 */
export interface ShippingUser {
  id: string;
  name: string;
  email?: string;
}

/**
 * Representa la información de quién creó o actualizó un registro.
 */
export interface AuditUser {
  id: string;
  name: string;
}

/**
 * Representa la orden asociada al envío.
 */
export interface ShippingOrder {
  id: string;
  numeroOrden: string;
  quotation_id?: string;
  company?: ShippingCompany;
  user?: ShippingUser;
}

/**
 * Representa la información de RMA asociada al envío.
 */
export interface ShippingRma {
  id: string;
  rma_number: string;
  motivo: string;
  estado: string;
}

/**
 * Representa un evento en el historial de un envío.
 */
export interface HistoryEvent {
  timestamp: string;
  status: ShippingStatus;
  description: string;
  updated_by?: AuditUser;
}

/**
 * Representa la entidad principal de un envío.
 */
export interface Shipping {
  id: string; // UUID
  order_id?: string;  // Solo presente en envíos normales
  rma_id?: string;    // Solo presente en envíos RMA
  order?: ShippingOrder;
  rma?: ShippingRma;  // Objeto poblado si es envío RMA
  direccion_entrega?: string;
  transportadora?: string;
  guia?: string;
  estado: ShippingStatus;
  historial?: HistoryEvent[];
  notas?: string;
  fechaEstimada?: string; // YYYY-MM-DD
  fechaEntregaReal?: string; // YYYY-MM-DD
  created_by?: AuditUser;
  updated_by?: AuditUser;
  created_at?: string;
  updated_at?: string;
}

// --- DTOs (Data Transfer Objects) para las peticiones ---

/**
 * Datos necesarios para crear un nuevo envío.
 * Corresponde al `CreateShippingDto` del backend.
 */
export type CreateShippingPayload = Omit<
  Shipping,
  'id' | 'estado' | 'historial' | 'fechaEntregaReal'
>;

/**
 * Datos para actualizar el estado de un envío.
 * Corresponde al `UpdateStatusDto` del backend.
 */
export interface UpdateStatusPayload {
  direccionEntrega?: string; // Propiedad opcional
  transportadora?: string; // Propiedad opcional
  guia?: string; // Propiedad opcional
  estado: ShippingStatus;
  description: string;
  fechaEstimada?: string; // Propiedad opcional
  comprobanteGuiaBase64?: string | null; // Propiedad opcional
}

/**
 * Datos para actualizar la fecha de entrega real.
 * Corresponde al `UpdateDeliveryDateDto` del backend.
 */
export interface UpdateDeliveryDatePayload {
  fechaEntregaReal: string; // YYYY-MM-DD
}
