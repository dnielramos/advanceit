import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { from, Observable } from 'rxjs';
import { bufferCount, concatMap, map } from 'rxjs/operators';

import { ApiDetailsResponse, ProductoIngram, ProductoIngramDetails  } from '../models/ingram';
import { ingramPartNumbersDell } from '../constants/ingramPartNumbersDell';

@Injectable({ providedIn: 'root' })
export class IngramService {
  private API_DETAILS_URL = 'https://advance-backend.onrender.com/scraper/multiple';
  private API_PRODUCTS_URL = 'http://localhost:3002/ingram/products';

  constructor(private http: HttpClient) {}

  /**
   * Devuelve un Observable que emite arrays de 10 productos cada vez
   */
  getProductDetailsInBatches(numbers: string[]): Observable<ProductoIngramDetails[]> {
    return from(numbers).pipe(
      // Agrupa cada 10 elementos en un array
      bufferCount(10),                                        // ← bufferCount agrupa en lotes de 10 :contentReference[oaicite:5]{index=5}
      // Para cada lote de 10, lanza la petición HTTP y espera su respuesta antes de pasar al siguiente
      concatMap(batch =>
        this.http
          .post<ApiDetailsResponse<ProductoIngramDetails[]>>(this.API_DETAILS_URL, { urls: batch })  // ← petición por lote :contentReference[oaicite:6]{index=6}
          .pipe(
            map(response => response.data)                     // ← extrae la propiedad `data` :contentReference[oaicite:7]{index=7}
          )
      )
    );
  }


    /**
   * Devuelve un Observable que emite arrays de hasta 10 productos cada vez.
   */
    getProductsInBatches(numbers: string[]): Observable<ProductoIngram[]> {
      return from(numbers).pipe(
        // Agrupa cada 10 números en un sub-array :contentReference[oaicite:4]{index=4}
        bufferCount(10),
        // Para cada lote de 10, realiza la petición y espera a que finalice antes de seguir :contentReference[oaicite:5]{index=5}
        concatMap(batch =>
          this.http
            .post<ProductoIngram[]>(this.API_PRODUCTS_URL, { ingramPartNumbers: batch })
            .pipe(
              map(response => response)
            )
        )
      );
    }

    getProducts(skus: string[]): Observable<ProductoIngram[]> {
    return this.http.post<ProductoIngram[]>(this.API_PRODUCTS_URL, {ingramPartNumbers: skus});
  }
}
