import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';

// --- Interfaces para tipado fuerte ---
export interface RmaEvidence {
  id?: string;
  rma_id?: string;
  tipo: string;
  url: string;
  descripcion?: string;
}

export interface RmaRequest {
  id?: string;
  order_id: string;
  rma_number?: string;
  motivo: string;
  estado?: 'pendiente' | 'aprobado' | 'rechazado' | 'procesando' | 'completado';
  evidencias?: RmaEvidence[];
  fecha_creacion?: string;
}

@Injectable({
  providedIn: 'root',
})
export class RmaService {
  private readonly baseUrl = 'http://localhost:3002/rmas'; // 🔧 Ajusta según tu backend

  constructor(private http: HttpClient) {}

  // -------------------------------
  // 📦 CRUD PRINCIPAL DE RMA
  // -------------------------------

  /** Obtiene todas las solicitudes RMA */
  getAllRmas(): Observable<RmaRequest[]> {
    return this.http
      .get<RmaRequest[]>(`${this.baseUrl}`)
      .pipe(catchError(this.handleError));
  }

  /** Obtiene un RMA por ID */
  getRmaById(id: string): Observable<RmaRequest> {
    return this.http
      .get<RmaRequest>(`${this.baseUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  /** Crea una nueva solicitud RMA */
  createRma(rma: RmaRequest): Observable<RmaRequest> {
    return this.http
      .post<RmaRequest>(`${this.baseUrl}`, rma)
      .pipe(catchError(this.handleError));
  }

  /** Actualiza el estado o datos de un RMA */
  updateRma(id: string, data: Partial<RmaRequest>): Observable<RmaRequest> {
    return this.http
      .patch<RmaRequest>(`${this.baseUrl}/${id}`, data)
      .pipe(catchError(this.handleError));
  }

  /** Elimina un RMA */
  deleteRma(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.baseUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // -------------------------------
  // 📎 GESTIÓN DE EVIDENCIAS
  // -------------------------------

  /** Añade evidencia a una solicitud RMA */
  addEvidence(rmaId: string, evidence: RmaEvidence): Observable<RmaEvidence> {
    return this.http
      .post<RmaEvidence>(`${this.baseUrl}/${rmaId}/evidencias`, evidence)
      .pipe(catchError(this.handleError));
  }

  /** Obtiene las evidencias asociadas a un RMA */
  getEvidencesByRma(rmaId: string): Observable<RmaEvidence[]> {
    return this.http
      .get<RmaEvidence[]>(`${this.baseUrl}/${rmaId}/evidencias`)
      .pipe(catchError(this.handleError));
  }

  /** Elimina una evidencia específica */
  deleteEvidence(rmaId: string, evidenceId: string): Observable<void> {
    return this.http
      .delete<void>(`${this.baseUrl}/${rmaId}/evidencias/${evidenceId}`)
      .pipe(catchError(this.handleError));
  }

  // -------------------------------
  // ⚠️ Manejo de errores
  // -------------------------------

  private handleError(error: HttpErrorResponse) {
    let message = 'Error desconocido';
    if (error.error instanceof ErrorEvent) {
      message = `Error de cliente: ${error.error.message}`;
    } else {
      message = `Error del servidor (${error.status}): ${error.message}`;
    }
    console.error('[RmaService Error]', message);
    return throwError(() => new Error(message));
  }
}
