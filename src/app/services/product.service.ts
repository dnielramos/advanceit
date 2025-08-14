import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, of } from 'rxjs';
import { ProductoFinal } from '../models/Productos';
import { ENVIRONMENT } from '../../enviroments/enviroment';
import { PRODUCTOS_DEFAULT } from '../constants/default-products';

// Interface for the complete API response for all products
export interface ApiGetAllProductsResponse {
  products: ProductoFinal[];
  total: number;
}

// Interface for the paginated products response
export interface PaginationDto {
  page?: number;
  limit?: number;
}

export interface PaginatedProductsResponse {
  products: ProductoFinal[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private readonly apiUrlRender = ENVIRONMENT.apiUrlRender;
  private API_ALL_URL = `${this.apiUrlRender}/advance-products/all`;
  // New URL for paginated products
  private API_PAGINATED_URL = `${this.apiUrlRender}/advance-products/all-paginated`;

  // BehaviorSubjects for different data streams
  private _allProducts$ = new BehaviorSubject<ProductoFinal[]>([]);
  public allProducts$: Observable<ProductoFinal[]> = this._allProducts$.asObservable();

  private _paginatedProducts$ = new BehaviorSubject<ProductoFinal[]>([]);
  public paginatedProducts$: Observable<ProductoFinal[]> = this._paginatedProducts$.asObservable();

  // State for pagination
  private currentPage = 1;
  private pageSize = 10;
  private hasMoreProducts = true;

  // Internal data arrays
  private _productos: ProductoFinal[] = [];
  private _productosFavorites: ProductoFinal[] = [];

  constructor(private http: HttpClient) {
    this.loadInitialProducts();
  }

  // --- Initial Loading Methods ---

  private loadInitialProducts(): void {
    // We subscribe to execute the request
    this.getAllProducts().subscribe((response) => {
      if (response && response.products) {
        this._productos = response.products;
        this._allProducts$.next(this._productos);

        console.log('✅ Products loaded and emitted:', this._productos);

        // Logic for favorites
        const dellProducts = this._productos.filter((p) =>
          p.marca.toLowerCase().includes('dell')
        );
        this._productosFavorites =
          dellProducts.length > 0 ? dellProducts : PRODUCTOS_DEFAULT;
      } else {
        console.error('API response does not have the expected format:', response);
      }
    });
  }

  /**
   * Returns an Observable that, when subscribed to, emits the complete API response.
   */
  getAllProducts(): Observable<ApiGetAllProductsResponse> {
    return this.http.get<ApiGetAllProductsResponse>(this.API_ALL_URL);
  }

  // --- Pagination Methods ---

  /**
   * Resets the pagination state to start fetching products from the beginning.
   * This should be called when a user wants to load a new set of products.
   */
  public resetPagination(): void {
    this.currentPage = 1;
    this.hasMoreProducts = true;
    this._paginatedProducts$.next([]);
  }

  /**
   * Fetches the next page of products from the server.
   *
   * @returns an Observable that completes after the products are loaded.
   */
  public getNextPage(): Observable<PaginatedProductsResponse | null> {
    // Prevent new calls if there are no more products to load
    if (!this.hasMoreProducts) {
      console.log('No more products to load.');
      return of(null);
    }

    // Construct the query parameters
    const params = new HttpParams()
      .set('page', this.currentPage.toString())
      .set('limit', this.pageSize.toString());

    return this.http.get<PaginatedProductsResponse>(this.API_PAGINATED_URL, { params }).pipe(
      tap((response) => {
        if (response && response.products) {
          // Update the internal state with the new products
          const currentProducts = this._paginatedProducts$.getValue();
          this._paginatedProducts$.next([...currentProducts, ...response.products]);

          // Update pagination state for the next call
          this.hasMoreProducts = response.hasNextPage;
          if (this.hasMoreProducts) {
            this.currentPage++;
          }
          console.log(`✅ Page ${response.page} loaded. Total products: ${this._paginatedProducts$.getValue().length}`);
        }
      }),
      catchError((error) => {
        console.error('Error fetching paginated products:', error);
        return of(null);
      })
    );
  }

  // --- Getters for Components ---

  get getProductos() {
    return this._productos;
  }

  get getFavoritesProducts() {
    return this._productosFavorites;
  }
}
