// src/app/core/services/gemini-tts.service.ts
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, timer, catchError, map, retryWhen, mergeMap, tap } from 'rxjs';

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  features: string[];
  useCases: string[];
}

export interface AudioGenerationResponse {
  audioContent: string; // Base64 audio data
  metadata: {
    duration: number;
    format: string;
    sampleRate: number;
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
export class GeminiTtsService {
  private readonly httpClient = inject(HttpClient);
  private readonly apiUrl = 'https://generativelanguage.googleapis.com/v1beta';
  private readonly model = 'gemini-2.5-flash-tts-preview'; // Modelo TTS de nivel gratuito
  private readonly apiKey = 'AIzaSyA58KY6P7ST5tksvy8ZtfrrqBjIaQH1qWU';
  
  // Señales reactivas para estado
  isLoading = signal(false);
  error = signal<string | null>(null);
  rateLimitInfo = signal<RateLimitInfo>({
    remainingRequests: 15, // Límite inicial RPD
    remainingTokens: 10000, // Límite inicial TPM
    resetTime: new Date(Date.now() + 24 * 60 * 60 * 1000) // Mañana
  });

  /**
   * Genera audio a partir de un prompt descriptivo sobre un producto
   * @param product Datos del producto para generar el audio
   * @param language Código de idioma (ej: 'es-ES', 'en-US')
   * @returns Observable con los datos de audio en base64
   */
  generateProductAudio(product: Product, language: string = 'es-ES'): Observable<AudioGenerationResponse> {
    this.isLoading.set(true);
    this.error.set(null);

    const prompt = this.createProductPrompt(product, language);
    
    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: 500
      },
      safetySettings: this.getDefaultSafetySettings(),
      audioConfig: {
        languageCode: language,
        voiceName: this.getVoiceName(language),
        speakingRate: 1.0,
        pitch: 0.0,
        volumeGainDb: 0.0
      }
    };

    return this.httpClient.post<any>(
      `${this.apiUrl}/models/${this.model}:generateContent?key=${this.apiKey}`,
      requestBody,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => this.processAudioResponse(response)),
      retryWhen(errors => 
        errors.pipe(
          mergeMap((error: HttpErrorResponse, retryCount: number) => {
            if (error.status === 429 && retryCount < 2) {
              const delay = Math.pow(2, retryCount) * 1000;
              console.log(`Reintentando generación de audio en ${delay/1000}s... (intento ${retryCount + 1})`);
              return timer(delay);
            }
            return throwError(() => error);
          })
        )
      ),
      catchError(error => this.handleApiError(error)),
      tap(() => {
        this.updateRateLimits();
        this.isLoading.set(false);
      })
    );
  }

  /**
   * Convierte datos base64 de audio a Blob para reproducción
   * @param base64Audio Datos de audio en base64
   * @param format Formato del audio (default: 'audio/mp3')
   * @returns Blob listo para reproducir
   */
  convertBase64ToAudioBlob(base64Audio: string, format: string = 'audio/mp3'): Blob {
    const byteCharacters = atob(base64Audio);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: format });
  }

  /**
   * Crea una URL para reproducir el audio
   * @param base64Audio Datos de audio en base64
   * @param format Formato del audio
   * @returns URL de objeto para reproducción
   */
  createAudioUrl(base64Audio: string, format: string = 'audio/mp3'): string {
    const blob = this.convertBase64ToAudioBlob(base64Audio, format);
    return URL.createObjectURL(blob);
  }

  /**
   * Limpia las URLs de objeto creadas para reproducción
   * @param url URL a limpiar
   */
  revokeAudioUrl(url: string): void {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  }

  /**
   * Reproduce el audio directamente en el navegador
   * @param base64Audio Datos de audio en base64
   * @param format Formato del audio
   */
  playAudio(base64Audio: string, format: string = 'audio/mp3'): void {
    const audioUrl = this.createAudioUrl(base64Audio, format);
    const audio = new Audio(audioUrl);
    
    audio.onended = () => {
      this.revokeAudioUrl(audioUrl);
    };
    
    audio.onerror = (e) => {
      console.error('Error al reproducir audio:', e);
      this.revokeAudioUrl(audioUrl);
    };
    
    audio.play().catch(error => {
      console.error('Error al iniciar reproducción:', error);
      this.revokeAudioUrl(audioUrl);
    });
  }

  /**
   * Obtiene los límites de frecuencia actuales para el modelo TTS
   * @returns Objeto con los límites de frecuencia
   */
  getRateLimits(): { rpm: number; tpm: number; rpd: number } {
    return {
      rpm: 3,     // Requests Per Minute
      tpm: 10000, // Tokens Per Minute  
      rpd: 15     // Requests Per Day
    };
  }

  private createProductPrompt(product: Product, language: string): string {
    const isSpanish = language.startsWith('es');
    
    if (isSpanish) {
      return `Actúa como un experto en marketing y ventas. Describe de manera profesional y atractiva el producto "${product.name}" para una presentación de audio. Incluye:

1. Una breve introducción sobre qué es el producto
2. Sus características principales y beneficios
3. Casos de uso prácticos y situaciones donde es útil
4. El valor que aporta al cliente
5. Una conclusión motivadora

Mantén un tono profesional pero cercano, como si estuvieras hablando directamente con un cliente potencial. Usa un lenguaje claro y persuasivo. El producto pertenece a la categoría ${product.category} y tiene estas características específicas: ${product.features.join(', ')}. Los casos de uso principales son: ${product.useCases.join(', ')}.

Describe el producto en un párrafo fluido de aproximadamente 150-200 palabras, ideal para una narración de audio profesional.`;
    } else {
      return `Act as a marketing and sales expert. Describe the product "${product.name}" professionally and attractively for an audio presentation. Include:

1. A brief introduction about what the product is
2. Its main features and benefits
3. Practical use cases and situations where it's useful
4. The value it provides to the customer
5. A motivating conclusion

Maintain a professional yet approachable tone, as if speaking directly to a potential customer. Use clear and persuasive language. The product belongs to the ${product.category} category and has these specific features: ${product.features.join(', ')}. The main use cases are: ${product.useCases.join(', ')}.

Describe the product in a fluid paragraph of approximately 150-200 words, ideal for a professional audio narration.`;
    }
  }

  private getVoiceName(language: string): string {
    const voiceMap: Record<string, string> = {
      'es-ES': 'es-ES-Neural2-F',    // Voz femenina española
      'es-MX': 'es-MX-Neural2-F',    // Voz femenina mexicana
      'en-US': 'en-US-Neural2-F',    // Voz femenina americana
      'en-GB': 'en-GB-Neural2-F',    // Voz femenina británica
      'fr-FR': 'fr-FR-Neural2-F',    // Voz femenina francesa
      'de-DE': 'de-DE-Neural2-F',    // Voz femenina alemana
      'it-IT': 'it-IT-Neural2-F',    // Voz femenina italiana
      'pt-BR': 'pt-BR-Neural2-F',    // Voz femenina brasileña
    };
    
    return voiceMap[language] || 'es-ES-Neural2-F';
  }

  private getDefaultSafetySettings(): any[] {
    return [
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
    ];
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
    });
  }

  private processAudioResponse(response: any): AudioGenerationResponse {
    if (!response.candidates || response.candidates.length === 0) {
      throw new Error('No se encontraron candidatos en la respuesta');
    }

    const candidate = response.candidates[0];
    if (candidate.finishReason !== 'STOP') {
      throw new Error(`La generación falló. Razón: ${candidate.finishReason || 'UNKNOWN'}`);
    }

    let audioContent = '';
    let textContent = '';

    for (const part of candidate.content.parts) {
      if (part.audioData?.data) {
        audioContent = part.audioData.data;
      }
      if (part.text) {
        textContent += part.text;
      }
    }

    if (!audioContent) {
      throw new Error('No se encontró contenido de audio en la respuesta');
    }

    return {
      audioContent,
      metadata: {
        duration: this.estimateDuration(textContent),
        format: 'audio/mp3',
        sampleRate: 24000,
        model: this.model
      }
    };
  }

  private estimateDuration(text: string): number {
    // Estimación aproximada: 150 palabras por minuto
    const words = text.split(/\s+/).length;
    return (words / 150) * 60; // segundos
  }

  private handleApiError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Error desconocido en la generación de audio';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error del cliente: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 400:
          errorMessage = 'Solicitud inválida. Verifica el formato de tu prompt.';
          break;
        case 401:
          errorMessage = 'No autorizado. Verifica tu API key de Gemini.';
          break;
        case 403:
          errorMessage = 'Acceso denegado. No tienes permisos para usar este modelo.';
          break;
        case 429:
          errorMessage = `Límite de frecuencia excedido. Límites gratuitos: 3 solicitudes/minuto, 15 solicitudes/día. Espera unos minutos o prueba mañana.`;
          this.updateRateLimitsAfterError();
          break;
        case 500:
          errorMessage = 'Error interno del servidor. Inténtalo más tarde.';
          break;
        default:
          errorMessage = `Error ${error.status}: ${error.message}`;
      }
    }
    
    console.error('GeminiTtsService Error:', error);
    this.error.set(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  private updateRateLimits(): void {
    const currentLimits = this.rateLimitInfo();
    const now = new Date();
    
    // Resta una solicitud y actualiza el tiempo de reset (24 horas para RPD)
    this.rateLimitInfo.set({
      remainingRequests: Math.max(0, currentLimits.remainingRequests - 1),
      remainingTokens: Math.max(0, currentLimits.remainingTokens - 500), // Aproximación
      resetTime: new Date(now.setHours(23, 59, 59, 999)) // Medianoche hora del Pacífico
    });
  }

  private updateRateLimitsAfterError(): void {
    // En caso de error 429, actualizamos los límites con valores más conservadores
    this.rateLimitInfo.set({
      remainingRequests: 0,
      remainingTokens: 0,
      resetTime: new Date(Date.now() + 60000) // 1 minuto para RPM
    });
  }
}