import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { from, Observable, concat, BehaviorSubject } from 'rxjs';
import { bufferCount, concatMap, map, scan, delay } from 'rxjs/operators';

// Asegúrate de que la ruta al modelo sea correcta
import { ApiDetailsResponse, ProductAdvance } from '../models/ingram';
import { Producto } from '../models/Productos';

interface SaveBatchResponse {
  message: string;
}

export interface CategoryResponse {
  total: number;
  products: number;
  categories: { name: string; quantity: number }[];
}

@Injectable({ providedIn: 'root' })
export class AdvanceProductsService {
  private API_PRODUCTS_URL = 'https://advance-backend.onrender.com/advance-products/ingram';
  private API_LIST_URL = 'https://advance-backend.onrender.com/advance-products/all';
  private API_CATEGORY_URL = 'https://advance-backend.onrender.com/advance-products/categories';

  // BehaviorSubject para emitir el array de productos de forma progresiva
  private _allProducts$ = new BehaviorSubject<ApiDetailsResponse<ProductAdvance>[]>([]);
  public allProducts$: Observable<ApiDetailsResponse<ProductAdvance>[]> = this._allProducts$.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Envía un lote de productos a la API para ser guardados.
   * @param payload El lote de productos a guardar.
   * @returns Un Observable con la respuesta de la API.
   */
  saveBatch(payload: ApiDetailsResponse<ProductAdvance>[]): Observable<SaveBatchResponse> {
    return this.http.post<SaveBatchResponse>(this.API_PRODUCTS_URL, payload);
  }

  /**
   * Obtiene todos los productos de la API en lotes y los emite progresivamente.
   * @param batchSize El tamaño del lote para la carga progresiva (opcional, por defecto es 5).
   * @param delayTime El tiempo de espera entre emisiones de lotes (en ms, opcional, por defecto es 500ms).
   * @returns Un Observable que emite arrays de productos de forma progresiva.
   */
  loadAllProductsProgressively(batchSize: number = 10, delayTime: number = 500): Observable<ApiDetailsResponse<ProductAdvance>[]> {
    return this.http.get<ApiDetailsResponse<ProductAdvance>[]>(this.API_LIST_URL).pipe(
      // Convertir el array de productos inicial en un Observable
      concatMap(allProducts => from(allProducts)),
      // Agrupar los productos en lotes
      bufferCount(batchSize),
      // Emitir cada lote con un retraso
      concatMap(batch => from([batch]).pipe(delay(delayTime))),
      // Acumular los lotes emitidos en el BehaviorSubject
      scan((acc, batch) => {
        const updatedProducts = [...acc, ...batch];
        this._allProducts$.next(updatedProducts);
        return updatedProducts;
      }, [] as ApiDetailsResponse<ProductAdvance>[])
    );
  }

  /**
   * Devuelve un Observable con la lista completa de productos (se carga de una vez).
   * Útil si la carga progresiva ya se ha completado o para otros casos de uso.
   * @returns Un Observable con el array completo de productos.
   */
  getAllProducts(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.API_LIST_URL);
  }

   getAllCategories(): Observable<CategoryResponse> {
    return this.http.get<CategoryResponse>(this.API_CATEGORY_URL);
  }
}
