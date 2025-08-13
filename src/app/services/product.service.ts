import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { ProductoFinal } from '../models/Productos';
import { ENVIRONMENT } from '../../enviroments/enviroment';
import { PRODUCTOS_DEFAULT } from '../constants/default-products';

// Interfaz para la respuesta completa de la API
export interface ApiGetAllProductsResponse {
  products: ProductoFinal[];
  total: number;
}

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private readonly apiUrlRender = ENVIRONMENT.apiUrlRender;
  private API_LIST_URL = `${this.apiUrlRender}/advance-products/all`;

  private _allProducts$ = new BehaviorSubject<ProductoFinal[]>([]);
  public allProducts$: Observable<ProductoFinal[]> = this._allProducts$.asObservable();

  // Puedes hacer estas propiedades privadas si solo se modifican dentro del servicio
  private _productos: ProductoFinal[] = [];
  private _productosFavorites: ProductoFinal[] = [];

  constructor(private http: HttpClient) {
    this.loadInitialProducts();
  }

  private loadInitialProducts(): void {
    // Nos suscribimos para ejecutar la petición
    this.getAllProducts().subscribe((response) => {
      // Es buena práctica verificar que la respuesta y la propiedad existan
      if (response && response.products) {
        this._productos = response.products;
        this._allProducts$.next(this._productos); // Emitimos los productos al BehaviorSubject

        console.log('✅ Productos cargados y emitidos:', this._productos);

        // Lógica de favoritos
        const dellProducts = this._productos.filter((p) => p.marca.toLowerCase().includes("dell"));
        this._productosFavorites = dellProducts.length > 0 ? dellProducts : PRODUCTOS_DEFAULT;
      } else {
        console.error('La respuesta de la API no tiene el formato esperado:', response);
      }
    });
  }

  /**
   * Devuelve un Observable que, al suscribirse, emite la respuesta completa de la API.
   */
  getAllProducts(): Observable<ApiGetAllProductsResponse> {
    // 1. Especifica el tipo correcto en la petición http.get.
    // 2. No hagas console.log aquí, ya que solo imprimirías el Observable.
    return this.http.get<ApiGetAllProductsResponse>(this.API_LIST_URL);
  }

  // Getters públicos para acceder a los datos desde los componentes
  get getProductos() {
    return this._productos;
  }

  get getFavoritesProducts() {
    return this._productosFavorites;
  }
}
