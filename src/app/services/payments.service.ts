// src/app/services/payments.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { 
  Payment, 
  CreatePaymentPayload, 
  UpdateStatusPayload, 
  UpdateDatePayload 
} from '../models/payment.model';
import { ENVIRONMENT } from '../../enviroments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class PaymentsService {
  private readonly http = inject(HttpClient);
  
  // Es recomendable usar variables de entorno para esta URL.
  private readonly apiUrl = `${ENVIRONMENT.apiUrlRender}/payments`;

  /**
   * Crea un nuevo registro de pago.
   * @param paymentData - Datos del nuevo pago.
   * @returns Un Observable con el pago creado.
   */
  createPayment(paymentData: CreatePaymentPayload): Observable<Payment> {
    return this.http.post<Payment>(this.apiUrl, paymentData).pipe(
      tap(newPayment => console.log('Pago creado:', newPayment)),
      catchError(this.handleError)
    );
  }

  /**
   * Obtiene todos los pagos desde el backend.
   * @returns Un Observable con un array de pagos.
   */
  getAllPayments(): Observable<Payment[]> {
    return this.http.get<Payment[]>(this.apiUrl).pipe(
      tap(payments => console.log(`Se obtuvieron ${payments.length} pagos`)),
      catchError(this.handleError)
    );
  }

  /**
   * Obtiene un pago específico por su ID.
   * @param id - El ID (UUID) del pago.
   * @returns Un Observable con el pago encontrado.
   */
  getPaymentById(id: string): Observable<Payment> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<Payment>(url).pipe(
      tap(payment => console.log('Pago obtenido por ID:', payment)),
      catchError(this.handleError)
    );
  }

  /**
   * Obtiene un pago específico por el ID de la orden.
   * @param orderId - El ID de la orden.
   * @returns Un Observable con el pago encontrado.
   */
  getPaymentByOrderId(orderId: string): Observable<Payment> {
    const url = `${this.apiUrl}/order/${orderId}`;
    return this.http.get<Payment>(url).pipe(
      tap(payment => console.log('Pago obtenido por OrderID:', payment)),
      catchError(this.handleError)
    );
  }

  /**
   * Actualiza el estado de un pago.
   * @param id - ID del pago a actualizar.
   * @param payload - Objeto con el nuevo estado.
   * @returns Un Observable con el pago actualizado.
   */
  updatePaymentStatus(id: string, payload: UpdateStatusPayload): Observable<Payment> {
    const url = `${this.apiUrl}/${id}/status`;
    return this.http.patch<Payment>(url, payload).pipe(
      tap(updatedPayment => console.log('Estado del pago actualizado:', updatedPayment)),
      catchError(this.handleError)
    );
  }

  /**
   * Actualiza la fecha en que se realizó un pago.
   * @param id - ID del pago a actualizar.
   * @param payload - Objeto con la nueva fecha de pago.
   * @returns Un Observable con el pago actualizado.
   */
  updatePaymentDate(id: string, payload: UpdateDatePayload): Observable<Payment> {
    const url = `${this.apiUrl}/${id}/date`;
    return this.http.patch<Payment>(url, payload).pipe(
      tap(updatedPayment => console.log('Fecha de pago actualizada:', updatedPayment)),
      catchError(this.handleError)
    );
  }

  /**
   * Sube el archivo de comprobante para un pago específico.
   * @param id - ID del pago.
   * @param voucherFile - El archivo (File) del comprobante a subir.
   * @returns Un Observable con el pago actualizado (sin el buffer del comprobante).
   */
  uploadVoucher(id: string, voucherFile: File): Observable<Payment> {
    const url = `${this.apiUrl}/${id}/voucher`;
    
    // Para subir archivos, se debe usar FormData.
    const formData = new FormData();
    // 'comprobante' debe coincidir con el nombre del campo en el FileInterceptor del backend.
    formData.append('comprobante', voucherFile, voucherFile.name);

    return this.http.post<Payment>(url, formData).pipe(
      tap(() => console.log(`Comprobante subido para el pago ID: ${id}`)),
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
      errorMessage = `Error del servidor (código ${error.status}): ${error.error.message || error.statusText}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}