// src/app/models/shipping.model.ts

/**
 * Representa los posibles estados de un envío.
 */
export type ShippingStatus = 'preparando' | 'en_transito' | 'entregado' | 'fallido';

/**
 * Representa un evento en el historial de un envío.
 */
export interface HistoryEvent {
    timestamp: string;
    status: ShippingStatus;
    description: string;
}

/**
 * Representa la entidad principal de un envío.
 */
export interface Shipping {
    id: string; // UUID
    order_id: string;
    transportadora: string;
    guia: string;
    estado: ShippingStatus;
    historial?: HistoryEvent[];
    notas?: string;
    fechaEstimada: string; // YYYY-MM-DD
    fechaEntregaReal?: string; // YYYY-MM-DD
}

// --- DTOs (Data Transfer Objects) para las peticiones ---

/**
 * Datos necesarios para crear un nuevo envío.
 * Corresponde al `CreateShippingDto` del backend.
 */
export type CreateShippingPayload = Omit<Shipping, 'id' | 'estado' | 'historial' | 'fechaEntregaReal'>;

/**
 * Datos para actualizar el estado de un envío.
 * Corresponde al `UpdateStatusDto` del backend.
 */
export interface UpdateStatusPayload {
    estado: ShippingStatus;
    description: string;
}

/**
 * Datos para actualizar la fecha de entrega real.
 * Corresponde al `UpdateDeliveryDateDto` del backend.
 */
export interface UpdateDeliveryDatePayload {
    fechaEntregaReal: string; // YYYY-MM-DD
}