import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  CreateFullQuotationDto,
  Quotation,
  QuotationDetail,
  UpdateQuotationDto,
  QuotationStatus,
} from '../models/quotation.types'; // Asegúrate de que este path sea correcto
import { ENVIRONMENT } from '../../enviroments/enviroment';
import { PopulatedQuotation } from '../models/quotation-populated';



/**
 * Servicio para la gestión de cotizaciones, interactuando con el backend.
 */
@Injectable({
  providedIn: 'root',
})
export class QuotationService {
  private apiUrl = `${ENVIRONMENT.apiUrlRender}/quotations`;

  constructor(private http: HttpClient) {}

  /**
   * Maneja errores HTTP y lanza una excepción con un mensaje descriptivo.
   * @param error El objeto de error HTTP.
   * @returns Un Observable que lanza una excepción.
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ha ocurrido un error desconocido.';
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente o de la red
      errorMessage = `Error del cliente: ${error.error.message}`;
    } else {
      // El backend devolvió un código de respuesta no exitoso.
      if (error.status === 404) {
        errorMessage = 'Recurso no encontrado. La cotización no existe.';
      } else if (error.status === 409) {
        errorMessage = 'Conflicto: No se puede actualizar una cotización expirada.';
      } else if (error.status >= 500) {
        errorMessage = 'Error del servidor. Inténtalo de nuevo más tarde.';
      } else {
        errorMessage = `Código de error: ${error.status}, mensaje: ${error.message}`;
      }
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Crea una nueva cotización con sus detalles.
   * @param data Los datos completos de la cotización.
   * @returns Un Observable de la cotización creada.
   */
  create(
    data: CreateFullQuotationDto,
  ): Observable<Quotation & { details: QuotationDetail[] }> {
    return this.http
      .post<Quotation & { details: QuotationDetail[] }>(this.apiUrl, data)
      .pipe(catchError(this.handleError));
  }

  /**
   * Obtiene todas las cotizaciones existentes.
   * @returns Un Observable con una lista de cotizaciones.
   */
  findAll(): Observable<Quotation[]> {
    return this.http
      .get<Quotation[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  /**
   * Obtiene todas las cotizaciones "pobladas" (con datos de usuario y compañía).
   * @returns Un Observable con una lista de cotizaciones pobladas.
   */
  findAllPopulated(): Observable<PopulatedQuotation[]> {
    return this.http
      .get<PopulatedQuotation[]>(`${this.apiUrl}`)
      .pipe(catchError(this.handleError));
  }


  /**
   * Obtiene una cotización específica por su ID, incluyendo sus detalles.
   * @param id El ID de la cotización.
   * @returns Un Observable de la cotización.
   */
  findOne(id: string): Observable<Quotation & { details: QuotationDetail[] }> {
    return this.http
      .get<Quotation & { details: QuotationDetail[] }>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Actualiza una cotización y sus detalles por ID.
   * @param id El ID de la cotización a actualizar.
   * @param data Los datos actualizados.
   * @returns Un Observable de la cotización actualizada.
   */
  update(
    id: string,
    data: CreateFullQuotationDto | UpdateQuotationDto,
  ): Observable<Quotation & { details: QuotationDetail[] }> {
    return this.http
      .patch<Quotation & { details: QuotationDetail[] }>(`${this.apiUrl}/${id}`, data)
      .pipe(catchError(this.handleError));
  }

  /**
   * Actualiza el estado de una cotización.
   * @param id El ID de la cotización.
   * @param status El nuevo estado.
   * @param approvedBy (Opcional) El ID del usuario que aprueba.
   * @returns Un Observable de la cotización con el estado actualizado.
   */
  updateStatus(
    id: string,
    status: QuotationStatus,
    approvedBy?: string,
  ): Observable<Quotation> {
    const body = { status, approved_by: approvedBy };
    return this.http
      .patch<Quotation>(`${this.apiUrl}/${id}/status`, body)
      .pipe(catchError(this.handleError));
  }
}
