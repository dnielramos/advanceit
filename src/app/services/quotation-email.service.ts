import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ENVIRONMENT } from '../../enviroments/enviroment';

export interface QuotationEmailData {
  to: string;
  numeroCotizacion: string;
  nombreCliente: string;
  razonSocial: string;
  nombreContacto: string;
  emailContacto: string;
  fechaCotizacion?: string;
  diasValidez: number;
  esOrdenDeContado: boolean;
  condicionesPago: string;
  creditoCubreOrden: boolean;
  creditoDisponible: number;
  productos: Array<{
    nombre: string;
    descripcion: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
  }>;
  subtotal: number;
  totalDescuentos: number;
  valorBaseDescuentos: number;
  valorLogistica: number;
  baseParaIVA: number;
  valorIVA: number;
  granTotal: number;
  anioActual?: number;
}

export interface QuotationEmailResponse {
  message: string;
  to: string;
  numeroCotizacion: string;
}

@Injectable({
  providedIn: 'root',
})
export class QuotationEmailService {
  private apiUrl = `${ENVIRONMENT.apiUrlRender}/email/send-quotation-confirmation`;

  constructor(private http: HttpClient) {}

  sendQuotationEmail(
    cotizacionData: QuotationEmailData
  ): Observable<QuotationEmailResponse> {
    return this.http
      .post<QuotationEmailResponse>(this.apiUrl, cotizacionData)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Error desconocido al enviar el correo de cotización';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del servidor
      switch (error.status) {
        case 400:
          errorMessage = 'Datos inválidos para el correo de cotización';
          break;
        case 404:
          errorMessage = 'Servicio de envío de cotizaciones no disponible';
          break;
        case 500:
          errorMessage = 'Error interno del servidor al enviar el correo';
          break;
        default:
          errorMessage = `Error ${error.status}: ${error.message}`;
      }

      if (error.error?.message) {
        errorMessage += ` - ${error.error.message}`;
      }
    }

    return throwError(() => new Error(errorMessage));
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }
}
