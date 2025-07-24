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
  _id?: string;
  numeroOrden: string;
  cliente: string;
  productos: Product[];
  nota: string;
  estadoPago: 'pagado' | 'no_pagado' | 'pendiente' | 'cancelado';
  total: number;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private apiUrl = 'http://localhost:3002/orders';
  private productSearchUrl = 'http://localhost:3002/products';

  constructor(private http: HttpClient) {}

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl);
  }

  searchProductBySku(sku: string): Observable<Product | null> {
    return this.http.get<Product | null>(`${this.productSearchUrl}/sku/${sku}`);
  }

  createOrder(order: Partial<Order>): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, order);
  }
}
