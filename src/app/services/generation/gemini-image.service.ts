// src/app/services/generation/gemini-image.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, timer, catchError, map, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GeminiImageService {
  private readonly httpClient = inject(HttpClient);
  private readonly apiUrl = 'https://generativelanguage.googleapis.com/v1beta';
  private readonly model = 'gemini-2.0-flash-image-preview';
  private readonly apiKey = 'AIzaSyA58KY6P7ST5tksvy8ZtfrrqBjIaQH1qWU';

  /**
   * Genera una imagen a partir de un texto descriptivo
   * @param prompt Texto descriptivo para generar la imagen
   * @returns Observable con los datos de la imagen generada en base64
   */
  generateImage(prompt: string): Observable<string> {
    if (!prompt || prompt.trim().length < 5) {
      return throwError(() => new Error('El prompt debe tener al menos 5 caracteres'));
    }

    const requestBody = {
      contents: [{
        parts: [{
          text: prompt.trim()
        }]
      }],
      generationConfig: {
        temperature: 0.4,
        topP: 0.95,
        maxOutputTokens: 1024
      },
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        }
      ]
    };

    return this.httpClient.post<any>(
      `${this.apiUrl}/models/${this.model}:generateContent?key=${this.apiKey}`,
      requestBody,
      {
        headers: this.getHeaders()
      }
    ).pipe(
      map(response => this.extractImageData(response)),
      catchError(this.handleError)
    );
  }

  /**
   * Genera una imagen a partir de texto e imágenes existentes (edición)
   * @param prompt Texto descriptivo para la modificación
   * @param imageBase64 Imagen base64 para editar
   * @param mimeType Tipo MIME de la imagen (ej: 'image/png', 'image/jpeg')
   * @returns Observable con los datos de la imagen generada en base64
   */
  generateWithImage(prompt: string, imageBase64: string, mimeType: string = 'image/png'): Observable<string> {
    if (!prompt || prompt.trim().length < 5) {
      return throwError(() => new Error('El prompt debe tener al menos 5 caracteres'));
    }

    if (!imageBase64) {
      return throwError(() => new Error('Se requiere una imagen para editar'));
    }

    const requestBody = {
      contents: [{
        parts: [
          { text: prompt.trim() },
          {
            inlineData: {
              mimeType: mimeType,
              data: imageBase64
            }
          }
        ]
      }],
      generationConfig: {
        temperature: 0.4,
        topP: 0.95,
        maxOutputTokens: 1024
      },
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        }
      ]
    };

    return this.httpClient.post<any>(
      `${this.apiUrl}/models/${this.model}:generateContent?key=${this.apiKey}`,
      requestBody,
      {
        headers: this.getHeaders()
      }
    ).pipe(
      map(response => this.extractImageData(response)),
      catchError(this.handleError)
    );
  }

  /**
   * Convierte datos base64 a Blob para descarga
   * @param base64Data Datos de la imagen en base64
   * @returns Blob listo para descargar
   */
  convertBase64ToBlob(base64Data: string): Blob {
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: 'image/png' });
  }

  /**
   * Crea una URL para previsualizar la imagen
   * @param base64Data Datos de la imagen en base64
   * @returns URL de objeto para previsualización
   */
  createPreviewUrl(base64Data: string): string {
    const blob = this.convertBase64ToBlob(base64Data);
    return URL.createObjectURL(blob);
  }

  /**
   * Limpia las URLs de objeto creadas para previsualización
   * @param url URL a limpiar
   */
  revokePreviewUrl(url: string): void {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  }

  /**
   * Obtiene los límites de frecuencia actuales para el modelo de generación de imágenes
   * @returns Objeto con los límites de frecuencia
   */
  getRateLimits(): { rpm: number; tpm: number; rpd: number } {
    // Valores para nivel gratuito según documentación
    return {
      rpm: 10,    // Requests Per Minute
      tpm: 200000, // Tokens Per Minute  
      rpd: 100    // Requests Per Day
    };
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
    });
  }

  private extractImageData(response: any): string {
    if (!response.candidates || response.candidates.length === 0) {
      throw new Error('No se encontraron candidatos en la respuesta');
    }

    const candidate = response.candidates[0];
    if (candidate.finishReason !== 'STOP') {
      throw new Error(`La generación falló. Razón: ${candidate.finishReason || 'UNKNOWN'}`);
    }

    let imageData = '';

    for (const part of candidate.content.parts) {
      if (part.inlineData?.data) {
        imageData = part.inlineData.data;
        break;
      }
    }

    if (!imageData) {
      throw new Error('No se encontró datos de imagen en la respuesta');
    }

    return imageData;
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Error desconocido';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del servidor
      switch (error.status) {
        case 400:
          errorMessage = 'Solicitud inválida. Verifica el formato de tu prompt.';
          break;
        case 401:
          errorMessage = 'No autorizado. Verifica tu API key.';
          break;
        case 403:
          errorMessage = 'Acceso denegado. No tienes permisos para esta operación.';
          break;
        case 429:
          errorMessage = 'Límite de frecuencia excedido. Espera unos minutos antes de intentar nuevamente.';
          break;
        case 500:
          errorMessage = 'Error interno del servidor. Inténtalo más tarde.';
          break;
        default:
          errorMessage = `Error ${error.status}: ${error.message}`;
      }
    }
    
    console.error('GeminiImageService Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}