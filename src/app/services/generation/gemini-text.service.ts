// src/app/core/services/gemini-text.service.ts
import { Injectable, signal } from '@angular/core';
import { Observable, throwError, timer } from 'rxjs';
import { catchError, retryWhen, mergeMap } from 'rxjs/operators';
import { GoogleGenAI } from '@google/genai';

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  features: string[];
  useCases: string[];
}

export interface TextGenerationResponse {
  text: string;
  metadata?: {
    model: string;
  };
}

export interface RateLimitInfo {
  remainingRequests: number;
  remainingTokens: number;
  resetTime: Date;
}

@Injectable({
  providedIn: 'root'
})
export class GeminiTextService {
  private readonly ai: GoogleGenAI;
  private readonly model: string = 'gemini-2.5-flash';
  
  // Estado reactivo (señales)
  isLoading = signal(false);
  error = signal<string | null>(null);
  rateLimitInfo = signal<RateLimitInfo>({
    remainingRequests: 15,
    remainingTokens: 10000,
    resetTime: new Date(Date.now() + 24 * 60 * 60 * 1000)
  });

  constructor() {
    // Inicializar el cliente de Google GenAI con la API key
    const apiKey = 'AIzaSyA58KY6P7ST5tksvy8ZtfrrqBjIaQH1qWU';
    this.ai = new GoogleGenAI({ apiKey });
  }

  /** Public: devuelve límites configurados (informativos) */
  getRateLimits(): { rpm: number; tpm: number; rpd: number } {
    return {
      rpm: 3,     // requests per minute (ejemplo)
      tpm: 10000, // tokens per minute (ejemplo)
      rpd: 15     // requests per day
    };
  }

  /**
   * Genera descripción de producto como texto usando Gemini (sin audio).
   * Conserva reintentos y manejo de errores parecido al servicio original.
   */
  generateProductDescription(product: Product, language: string = 'es-ES'): Observable<TextGenerationResponse> {
    this.isLoading.set(true);
    this.error.set(null);

    const prompt = this.createProductPrompt(product, language);

    return new Observable<TextGenerationResponse>(subscriber => {
      // Usar la API correcta según la documentación oficial
      this.ai.models.generateContent({
        model: this.model,
        contents: prompt,
        config: {
          temperature: 0.7,
          topP: 0.9,
          maxOutputTokens: 500,
          safetySettings: this.getDefaultSafetySettings(),
          // Deshabilitar el thinking para gemini-2.5-flash (más rápido)
          thinkingConfig: {
            thinkingBudget: 0
          }
        }
      })
        .then(response => {
          console.log('Respuesta completa de Gemini:', response);
          const processedResponse = this.processTextResponse(response);
          this.updateRateLimits();
          this.isLoading.set(false);
          subscriber.next(processedResponse);
          subscriber.complete();
        })
        .catch(err => {
          console.error('Error en generateContent:', err);
          this.isLoading.set(false);
          subscriber.error(err);
        });
    }).pipe(
      retryWhen(errors =>
        errors.pipe(
          mergeMap((error, retryCount) => {
            // reintenta en caso de 429 (rate limit) hasta 2 reintentos exponenciales
            if (error?.status === 429 && retryCount < 2) {
              const delay = Math.pow(2, retryCount) * 1000;
              console.warn(`Retrying text generation in ${delay}ms (attempt ${retryCount + 1})`);
              return timer(delay);
            }
            return throwError(() => error);
          })
        )
      ),
      catchError(err => this.handleApiError(err))
    );
  }

  /* ---------- Helpers ---------- */

  private processTextResponse(response: any): TextGenerationResponse {
    console.log('Procesando respuesta:', response);
    
    // Intentar múltiples formas de acceder al texto
    let responseText: string | null = null;

    // Forma 1: response.text (método directo)
    if (typeof response?.text === 'function') {
      try {
        responseText = response.text();
      } catch (e) {
        console.warn('No se pudo llamar a response.text():', e);
      }
    } else if (typeof response?.text === 'string') {
      responseText = response.text;
    }

    // Forma 2: candidates[0].content.parts[0].text (estructura REST)
    if (!responseText && response?.candidates?.[0]?.content?.parts?.[0]?.text) {
      responseText = response.candidates[0].content.parts[0].text;
    }

    // Forma 3: response.response.text() (estructura alternativa)
    if (!responseText && typeof response?.response?.text === 'function') {
      try {
        responseText = response.response.text();
      } catch (e) {
        console.warn('No se pudo llamar a response.response.text():', e);
      }
    }

    if (!responseText) {
      console.error('Estructura de respuesta no reconocida:', JSON.stringify(response, null, 2));
      throw new Error('La API de Gemini no devolvió texto en el formato esperado.');
    }

    console.log('Texto extraído exitosamente:', responseText.substring(0, 100) + '...');

    return {
      text: String(responseText).trim(),
      metadata: { model: this.model }
    };
  }

  private createProductPrompt(product: Product, language: string): string {
    const isSpanish = language.startsWith('es');

    if (isSpanish) {
      return `Actúa como un experto en marketing y ventas. Describe de manera profesional y atractiva el producto "${product.name}" para una presentación escrita. Incluye:

1. Una breve introducción sobre qué es el producto.
2. Sus características principales y beneficios.
3. Casos de uso prácticos y situaciones donde es útil.
4. El valor que aporta al cliente.
5. Una conclusión motivadora.

Mantén un tono profesional pero cercano, como si estuvieras hablando directamente con un cliente potencial. Usa un lenguaje claro y persuasivo. El producto pertenece a la categoría ${product.category} y tiene estas características específicas: ${product.features?.join(', ') ?? 'N/A'}. Los casos de uso principales son: ${product.useCases?.join(', ') ?? 'N/A'}.

Describe el producto en un párrafo fluido de aproximadamente 150-200 palabras, ideal para una narración y para uso en fichas de producto.`;
    } else {
      return `Act as a marketing and sales expert. Describe the product "${product.name}" professionally and attractively for written presentation. Include:

1. A brief introduction about what the product is.
2. Its main features and benefits.
3. Practical use cases and situations where it's useful.
4. The value it provides to the customer.
5. A motivating conclusion.

Maintain a professional yet approachable tone, as if speaking directly to a potential customer. The product belongs to the ${product.category} category and has these specific features: ${product.features?.join(', ') ?? 'N/A'}. The main use cases are: ${product.useCases?.join(', ') ?? 'N/A'}.

Describe the product in a fluid paragraph of approximately 150-200 words.`;
    }
  }

  private getDefaultSafetySettings(): any[] {
    return [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
    ];
  }

  private handleApiError(error: any): Observable<never> {
    let errorMessage = 'Error desconocido en la generación de texto';

    if (error?.status) {
      switch (error.status) {
        case 400:
          errorMessage = 'Solicitud inválida. Revisa el prompt y el body.';
          break;
        case 401:
          errorMessage = 'No autorizado. Verifica tu API key de Gemini.';
          break;
        case 403:
          errorMessage = 'Acceso denegado. Revisa permisos.';
          break;
        case 429:
          errorMessage = 'Límite de frecuencia excedido. Intenta de nuevo en unos minutos.';
          this.updateRateLimitsAfterError();
          break;
        case 500:
          errorMessage = 'Error interno del servidor de Gemini.';
          break;
        default:
          errorMessage = `Error ${error.status}: ${error.message || JSON.stringify(error)}`;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    console.error('GeminiTextService Error:', error);
    this.error.set(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  private updateRateLimits(): void {
    const current = this.rateLimitInfo();
    const now = new Date();
    this.rateLimitInfo.set({
      remainingRequests: Math.max(0, current.remainingRequests - 1),
      remainingTokens: Math.max(0, current.remainingTokens - 500),
      resetTime: new Date(now.setHours(23, 59, 59, 999))
    });
  }

  private updateRateLimitsAfterError(): void {
    this.rateLimitInfo.set({
      remainingRequests: 0,
      remainingTokens: 0,
      resetTime: new Date(Date.now() + 60 * 1000) // 1 minuto
    });
  }

  // conveniente helper para compatibilidad con tu flujo sin promesas
  toPromise<T>(observable: Observable<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const sub = observable.subscribe({
        next: v => { sub.unsubscribe(); resolve(v); },
        error: e => { sub.unsubscribe(); reject(e); }
      });
    });
  }
}