// src/app/services/shippings.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import {
  Shipping,
  CreateShippingPayload,
  UpdateStatusPayload,
  UpdateDeliveryDatePayload,
} from '../models/shipping.model';
import { ENVIRONMENT } from '../../enviroments/enviroment';

export interface CreateShippingDto {
  order_id: string;
  transportadora?: string;
  guia?: string;
  fechaEstimada?: string; // YYYY-MM-DD
  notas?: string;
  direccion_entrega: string;
  user_id?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ShippingsService {
  // Asegúrate de que esta URL base coincida con la de tu backend.
  // Es recomendable usar variables de entorno para esto.
  private readonly apiUrl = `${ENVIRONMENT.apiUrl}/shippings`;

  constructor(private http: HttpClient) {}

  /**
   * Crea un nuevo registro de envío.
   * @param shippingData - Datos del nuevo envío.
   * @returns Un Observable con el envío creado.
   */
  createShipping(shippingData: CreateShippingPayload): Observable<Shipping> {
    return this.http.post<Shipping>(this.apiUrl, shippingData).pipe(
      tap((newShipping) => console.log('Envío creado:', newShipping)),
      catchError(this.handleError)
    );
  }

  /**
   * Obtiene todos los envíos desde el backend.
   * @returns Un Observable con un array de envíos.
   */
  getAllShippings(): Observable<Shipping[]> {
    return this.http.get<Shipping[]>(this.apiUrl).pipe(
      tap((shippings) =>
        console.log(`Se obtuvieron ${shippings.length} envíos`)
      ),
      catchError(this.handleError)
    );
  }

  /**
   * Obtiene un envío específico por su ID.
   * @param id - El ID (UUID) del envío.
   * @returns Un Observable con el envío encontrado.
   */
  getShippingById(id: string): Observable<Shipping> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<Shipping>(url).pipe(
      tap((shipping) => console.log(`Envío obtenido:`, shipping)),
      catchError(this.handleError)
    );
  }

  /**
   * Actualiza el estado de un envío y añade un evento al historial.
   * @param id - ID del envío a actualizar.
   * @param payload - Objeto con el nuevo estado y la descripción.
   * @returns Un Observable con el envío actualizado.
   */
  // updateShippingStatus(
  //   id: string,
  //   payload: UpdateStatusPayload
  // ): Observable<Shipping> {
  //   const url = `${this.apiUrl}/${id}/status`;
  //   return this.http.patch<Shipping>(url, payload).pipe(
  //     tap((updatedShipping) =>
  //       console.log('Estado del envío actualizado:', updatedShipping)
  //     ),
  //     catchError(this.handleError)
  //   );
  // }

  /**
   * Actualiza el envío (incluyendo estado, comprobante, etc.)
   * El backend se encarga de:
   * - Establecer fecha de entrega si estado === 'entregado'
   * - Guardar el documento si comprobanteGuiaBase64 está presente
   */
  updateShipping(
    id: string,
    payload: UpdateStatusPayload
  ): Observable<Shipping> {
    // Opcional: si quieres asegurar que la fecha de entrega se envíe explícitamente
    // (aunque tu backend la genera), podrías hacer:
    // if (payload.estado === 'entregado') {
    //   payload.fechaEntregaReal = new Date().toISOString();
    // }

    return this.http.patch<Shipping>(`${this.apiUrl}/${id}`, payload);
  }

  /**
   * Actualiza la fecha de entrega real de un envío.
   * @param id - ID del envío a actualizar.
   * @param payload - Objeto con la nueva fecha de entrega.
   * @returns Un Observable con el envío actualizado.
   */
  updateRealDeliveryDate(
    id: string,
    payload: UpdateDeliveryDatePayload
  ): Observable<Shipping> {
    const url = `${this.apiUrl}/${id}/delivery-date`;
    return this.http.patch<Shipping>(url, payload).pipe(
      tap((updatedShipping) =>
        console.log('Fecha de entrega actualizada:', updatedShipping)
      ),
      catchError(this.handleError)
    );
  }

  /**
   * Manejador de errores centralizado para las peticiones HTTP.
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocurrió un error desconocido.';
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente o de red.
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // El backend retornó un código de error.
      // El cuerpo de la respuesta puede contener pistas sobre lo que salió mal.
      errorMessage = `Error del servidor (código ${error.status}): ${
        error.error.message || error.statusText
      }`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
