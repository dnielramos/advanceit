import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { CategoryResponse, GroupedCategory } from './product.service';
import { ENVIRONMENT } from '../../enviroments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {

  private baseApi =   ENVIRONMENT.apiUrlRender;
  private apiUrl = `${this.baseApi}/categories`; // Cambia por tu URL real

  // Estado reactivo
  private categoriasSubject = new BehaviorSubject<GroupedCategory[]>([]);
  categorias$ = this.categoriasSubject.asObservable();

  constructor(private http: HttpClient) {
    // Carga automática al instanciar el servicio
    this.loadCategories();
  }

  /**
   * Carga las categorías desde la API y las guarda en el BehaviorSubject
   */
  private loadCategories(): void {
    // Si ya hay datos cargados, no vuelve a pedir
    if (this.categoriasSubject.getValue().length > 0) return;

    this.http.get<CategoryResponse>(this.apiUrl).pipe(
      tap((response: CategoryResponse) => {
        this.categoriasSubject.next(response.catalog.sort() || []);
      }),
      catchError((err) => {
        console.error('Error fetching categories:', err);
        this.categoriasSubject.next([]);
        return throwError(() => err);
      })
    ).subscribe();
  }

  /**
   * Obtiene el snapshot actual sin suscripción
   */
  get currentCategories(): GroupedCategory[] {
    return this.categoriasSubject.getValue();
  }

  /**
   * Agrega una categoría localmente
   */
  addCategory(category: GroupedCategory): void {
    const current = this.categoriasSubject.getValue();
    this.categoriasSubject.next([...current, category]);
  }
}
