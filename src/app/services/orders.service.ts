// src/app/services/orders.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { CacheService } from './cache.service';
import { ProductoFinal } from '../models/Productos';
import { CartItem } from './cart.service';
import { ENVIRONMENT } from '../../enviroments/enviroment';

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
  quotationId : string; // ID de la cotización asociada, si aplica
  shippingNo?: string;
  notas?: string;
}

export interface OrderProducts extends ProductoFinal {
  cantidad_solicitada: number; // Cantidad solicitada en la orden
}

@Injectable({
  providedIn: 'root',
})
export class OrdersService {
  // Es una buena práctica definir la URL base en los environments, pero esto funciona.
  private readonly baseURL = ENVIRONMENT.apiUrl;
  // private baseURL = 'http://localhost:3002';
  private readonly apiUrl = `${this.baseURL}/orders`;
  private readonly productSearchUrl = `${this.baseURL}/advance-products/by-sku`; // Asumo que esta ruta existe

  constructor(private http: HttpClient, private cache: CacheService) {}

  // --- Métodos para Órdenes ---

  getOrders(forceRefresh = false): Observable<Order[]> {
    const key = `${this.apiUrl}::all`;
    if (forceRefresh) this.cache.invalidate(key);
    const fetch$ = this.http.get<Order[]>(this.apiUrl);
    return this.cache.getOrFetch<Order[]>(key, fetch$);
  }

  getOrderById(id: string, forceRefresh = false): Observable<Order> {
    const key = `${this.apiUrl}/${id}`;
    if (forceRefresh) this.cache.invalidate(key);
    const fetch$ = this.http.get<Order>(`${this.apiUrl}/${id}`);
    return this.cache.getOrFetch<Order>(key, fetch$);
  }

  createOrder(order: Omit<Order, 'id'>): Observable<Order> {
    return this.http
      .post<Order>(this.apiUrl, order)
      .pipe(
        tap((res: any) => {
          // invalidar listas y prefijos
          this.cache.invalidate(`${this.apiUrl}::all`);
          this.cache.invalidate(`${this.apiUrl}`, true);
          if (res && res.id) this.cache.invalidate(`${this.apiUrl}/${res.id}`);
        }),
        catchError(this.handleError)
      );
  }

  updateOrder(
    id: string,
    order: Partial<Omit<Order, 'id'>>
  ): Observable<Order> {
    return this.http
      .put<Order>(`${this.apiUrl}/${id}`, order)
      .pipe(
        tap(() => {
          this.cache.invalidate(`${this.apiUrl}/${id}`);
          this.cache.invalidate(`${this.apiUrl}::all`);
          this.cache.invalidate(`${this.apiUrl}`, true);
        }),
        catchError(this.handleError)
      );
  }

  updateOrderStatus(
    id: string,
    status: 'pagado' | 'no_pagado' | 'pendiente' | 'cancelado'
  ): Observable<Order> {
    return this.http
      .patch<Order>(`${this.apiUrl}/${id}/status`, { status })
      .pipe(
        tap(() => {
          this.cache.invalidate(`${this.apiUrl}/${id}`);
          this.cache.invalidate(`${this.apiUrl}::all`);
        }),
        catchError(this.handleError)
      );
  }

  deleteOrder(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        tap(() => {
          this.cache.invalidate(`${this.apiUrl}/${id}`);
          this.cache.invalidate(`${this.apiUrl}::all`);
          this.cache.invalidate(`${this.apiUrl}`, true);
        }),
        catchError(this.handleError)
      );
  }

  // --- Métodos para Productos relacionados a una Orden ---

  getOrderProducts(orderId: string, forceRefresh = false): Observable<OrderProducts[]> {
    const key = `${this.apiUrl}/${orderId}/products`;
    if (forceRefresh) this.cache.invalidate(key);
    const fetch$ = this.http.get<OrderProducts[]>(`${this.apiUrl}/${orderId}/products`);
    return this.cache.getOrFetch<OrderProducts[]>(key, fetch$);
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
