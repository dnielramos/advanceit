// src/app/services/orders.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Product {
  _id?: string;
  nombre: string;
  sku: string;
  precio: number;
  [key: string]: any;
}

export interface Order {
  id?: string;
  numeroOrden: string;
  fecha: string;
  hora: string;
  estadoPago: 'pagado' | 'no_pagado' | 'pendiente' | 'cancelado';
  precioTotal: number;
  productos: string[];
  cliente: string;
  shippingNo: string;
  notas: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrdersService {

  private baseURL = 'https://advance-genai.onrender.com'
  // private apiUrl = 'https://advance-genai.onrender.com/orders';
  private apiUrl = `${this.baseURL}/orders`;
  private productSearchUrl = `${this.baseURL}/nexys/by-sku`;

  constructor(private http: HttpClient) {}

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl);
  }

  searchProductBySku(sku: string): Observable<Product | null> {
    return this.http.get<Product | null>(`${this.productSearchUrl}?sku=${sku}`);
  }

  createOrder(order: Partial<Order>): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, order);
  }
}
