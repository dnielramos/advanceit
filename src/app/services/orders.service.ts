// src/app/services/orders.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ProductoFinal } from '../models/Productos';
import { CartItem } from './cart.service';

// // Interfaces para tipado fuerte
// export interface Product {
//   _id?: string; // O el identificador que uses
//   nombre: string;
//   sku: string;
//   precio: number;
//   [key: string]: any; // Para otras propiedades
// }

export interface Order {
  id: string; // Cambiado de opcional a requerido para consistencia
  numeroOrden: string;
  fecha: string;
  hora: string;
  estadoPago: 'pagado' | 'no_pagado' | 'pendiente' | 'cancelado';
  precioTotal: number;
  productos: CartItem[]; // Array de cart Items
  cliente: string;
  shippingNo: string;
  notas?: string;
}

interface ApiNexsysResponse {
  return: ProductoFinal[];
}

@Injectable({
  providedIn: 'root',
})
export class OrdersService {
  // Es una buena práctica definir la URL base en los environments, pero esto funciona.
  private readonly baseURL = 'https://advance-genai.onrender.com';
  // private baseURL = 'http://localhost:3002';
  private readonly apiUrl = `${this.baseURL}/orders`;
  private readonly productSearchUrl = `${this.baseURL}/advance-products/by-sku`; // Asumo que esta ruta existe

  constructor(private http: HttpClient) {}

  // --- Métodos para Órdenes ---

  getOrders(): Observable<Order[]> {
    return this.http
      .get<Order[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  getOrderById(id: string): Observable<Order> {
    return this.http
      .get<Order>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  createOrder(order: Omit<Order, 'id'>): Observable<Order> {
    return this.http
      .post<Order>(this.apiUrl, order)
      .pipe(catchError(this.handleError));
  }

  updateOrder(
    id: string,
    order: Partial<Omit<Order, 'id'>>
  ): Observable<Order> {
    return this.http
      .put<Order>(`${this.apiUrl}/${id}`, order)
      .pipe(catchError(this.handleError));
  }

  updateOrderStatus(
    id: string,
    status: 'pagado' | 'no_pagado' | 'pendiente' | 'cancelado'
  ): Observable<Order> {
    return this.http
      .patch<Order>(`${this.apiUrl}/${id}/status`, { status })
      .pipe(catchError(this.handleError));
  }

  deleteOrder(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // --- Métodos para Productos relacionados a una Orden ---

  getOrderProducts(orderId: string): Observable<ApiNexsysResponse> {
    return this.http
      .get<ApiNexsysResponse>(`${this.apiUrl}/${orderId}/products`)
      .pipe(catchError(this.handleError));
  }

  searchProductBySku(sku: string): Observable<ProductoFinal> {
    return this.http.get<any>(`${this.productSearchUrl}?sku=${sku}`).pipe(
      map((response) => {

        console.log('Respuesta de búsqueda de producto por SKU:', response);
        // Validar estructura de respuesta
        if (response) {
          return response as ProductoFinal;
        }
        throw new Error('Producto no encontrado');
      }),
      catchError(this.handleError)
    );
  }

  // --- Manejo de Errores ---
  private handleError(error: any) {
    console.error('Ocurrió un error en la llamada API:', error);
    // Aquí podrías transformar el error para que sea más amigable al usuario
    return throwError(
      () =>
        new Error('Algo salió mal; por favor, inténtalo de nuevo más tarde.')
    );
  }
}
