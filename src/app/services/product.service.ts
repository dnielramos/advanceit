import { Injectable, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { from, Observable, concat, BehaviorSubject } from 'rxjs';
import { bufferCount, concatMap, map, scan, delay } from 'rxjs/operators';

// Asegúrate de que la ruta al modelo sea correcta
import { ApiDetailsResponse, ProductAdvance } from '../models/ingram';
import { ProductoFinal } from '../models/Productos';
import { ENVIRONMENT } from '../../enviroments/enviroment';
import { PRODUCTOS_DEFAULT } from '../constants/default-products';

interface SaveBatchResponse {
  message: string;
}

export interface CategoryResponse {
  catalog: GroupedCategory[];
}

export interface GroupedCategory {
  category: string;
  subCategories: string[];
  [key: string] : any;
}

@Injectable({ providedIn: 'root' })
export class ProductsService implements OnInit {
  private readonly apiUrlRender = ENVIRONMENT.apiUrlRender; // URL de tu API NestJS
  private API_PRODUCTS_URL = `${this.apiUrlRender}/advance-products/ingram`;
  private API_LIST_URL = `${this.apiUrlRender}/advance-products/all`;
  private API_CATEGORY_URL = `${this.apiUrlRender}/categories`;
  categorias: any = [];

  // BehaviorSubject para emitir el array de productos de forma progresiva
  private _allProducts$ = new BehaviorSubject<
    ApiDetailsResponse<ProductAdvance>[]
  >([]);
  public allProducts$: Observable<ApiDetailsResponse<ProductAdvance>[]> =
    this._allProducts$.asObservable();

  productos: ProductoFinal[] = [];

  productosFavorites: ProductoFinal[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getAllProducts().subscribe((productos) => {
      this.productos = productos;
      this.productosFavorites = productos.filter((p) => p.marca.includes("dell"));
    });
  }

  get getProductos() {
    return this.productos;
  }

  get getFavoritesProducts() {
    return this.productosFavorites;
  }

  /**
   * Devuelve un Observable con la lista completa de productos (se carga de una vez).
   * Útil si la carga progresiva ya se ha completado o para otros casos de uso.
   * @returns Un Observable con el array completo de productos.
   */
  getAllProducts(): Observable<ProductoFinal[]> {
    return this.http.get<ProductoFinal[]>(this.API_LIST_URL);
  }
}
