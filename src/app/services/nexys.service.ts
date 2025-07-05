// src/app/services/nexsys.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { environment } from '../../enviroments/enviroment';
import { ApiResponse } from '../models/Response'; // Asegúrate de que la ruta sea correcta


@Injectable({
  providedIn: 'root',
})
export class NexsysApiService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Obtener productos por marca
  getProductsByMark(mark: string): Observable<any> {
    const params = new HttpParams().set('mark', mark);
    return this.http
      .get<ApiResponse<any>>(`${this.apiUrl}/nexys/products-by-mark`, {
        params,
      })
      .pipe(
        map((response) => response.data),
        catchError((error) => this.handleError('getProductsByMark', error))
      );
  }

  // Obtener producto por SKU
  getProductBySKU(sku: string): Observable<any> {
    const params = new HttpParams().set('sku', sku);
    return this.http
      .get<ApiResponse<any>>(`${this.apiUrl}/nexys/product-by-sku`, { params })
      .pipe(
        map((response) => response.data),
        catchError((error) => this.handleError('getProductBySKU', error))
      );
  }

  // Obtener productos paginados
  getAllProducts(offset: number = 0, perPage: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('offset', offset.toString())
      .set('perPage', perPage.toString());

    return this.http
      .get<ApiResponse<any>>(`${this.apiUrl}/nexys/all-products`, { params })
      .pipe(
        map((response) => response.data),
        catchError((error) => this.handleError('getAllProducts', error))
      );
  }

  // Manejador de errores centralizado
  private handleError(operation = 'operation', error: any): Observable<never> {
    console.error(`${operation} failed: ${error.message}`);
    return throwError(
      () => new Error(`Error en ${operation}: ${error.message}`)
    );
  }
}
