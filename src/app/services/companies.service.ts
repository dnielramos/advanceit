import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError, Observable } from 'rxjs';
import { ENVIRONMENT } from '../../enviroments/enviroment';

// Interfaz de la entidad Company (ajústala si cambia en backend)
export interface Company {
  id: string;
  nit: string;
  razon_social: string;
  industria: string;
  pais: string;
  ciudad: string;
  condiciones_pago: string;
  descuento_base: string;
  descuento_especial: string;
  saldo_credito: string;
  saldo_gastado: string;
  valor_logistica: string;
  estado: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

// DTOs
export type CreateCompanyDto = Omit<Company, 'id' | 'estado' | 'fecha_creacion' | 'fecha_actualizacion'>;
export type UpdateCompanyDto = Partial<CreateCompanyDto>;

@Injectable({
  providedIn: 'root',
})
export class CompaniesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${ENVIRONMENT.apiUrlRender}/companies`; // 🔑 Cambia a tu URL real (ej: render, railway, etc.)

  /** Crear empresa */
  create(company: CreateCompanyDto): Observable<Company> {
    return this.http.post<Company>(this.baseUrl, company).pipe(
      catchError(this.handleError),
    );
  }

  /** Obtener todas las empresas */
  findAll(): Observable<Company[]> {
    return this.http.get<Company[]>(this.baseUrl).pipe(
      catchError(this.handleError),
    );
  }

  /** Buscar empresa por ID */
  findById(id: string): Observable<Company> {
    return this.http.get<Company>(`${this.baseUrl}/${id}`).pipe(
      catchError(this.handleError),
    );
  }

  /** Buscar empresa por NIT */
  findByNit(nit: string): Observable<Company> {
    return this.http.get<Company>(`${this.baseUrl}/nit/${nit}`).pipe(
      catchError(this.handleError),
    );
  }

  /** Actualizar empresa */
  update(id: string, data: UpdateCompanyDto): Observable<Company> {
    return this.http.patch<Company>(`${this.baseUrl}/${id}`, data).pipe(
      catchError(this.handleError),
    );
  }

  /** Eliminar empresa (soft delete) */
  softDelete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      catchError(this.handleError),
    );
  }

  /** Manejo de errores centralizado */
  private handleError(error: HttpErrorResponse) {
    let message = 'Error desconocido';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      message = `Error de red o cliente: ${error.error.message}`;
    } else {
      // Error del backend (NestJS HttpException ya devuelve status y mensaje)
      message = `Error ${error.status}: ${error.error?.message || error.message}`;
    }

    console.error('CompaniesService Error =>', message, error);
    return throwError(() => new Error(message));
  }
}
