import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ENVIRONMENT } from '../../enviroments/enviroment';

export interface Brand {
  name: string;
  quantity: number;
}

export interface BrandResponse {
  total: number;
  totalProducts: number;
  marks: Brand[];
}

@Injectable({
  providedIn: 'root',
})
export class BrandsService {
  private baseApi = ENVIRONMENT.apiUrlRender;
  private apiUrl = `${this.baseApi}/advance-products/brands`;

  private brandsSubject = new BehaviorSubject<Brand[]>([]);
  brands$ = this.brandsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadBrands();
  }

  /** Cargar marcas desde la API */
  private loadBrands(): void {
    if (this.brandsSubject.getValue().length > 0) return;

    this.http.get<BrandResponse>(this.apiUrl).pipe(
      tap((response: BrandResponse) => {
        this.brandsSubject.next(response.marks || []);
      }),
      catchError((err) => {
        console.error('Error fetching brands:', err);
        this.brandsSubject.next([]);
        return throwError(() => err);
      })
    ).subscribe();
  }

  /** Snapshot actual */
  get currentBrands(): Brand[] {
    return this.brandsSubject.getValue();
  }

  /** Agregar una marca localmente */
  addBrand(brand: Brand): void {
    const current = this.brandsSubject.getValue();
    this.brandsSubject.next([...current, brand]);
  }
}
