import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TrmService {
  private widgetLoadedSubject = new BehaviorSubject<boolean>(false);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  // --- ✅ Nuevos Subjects para el valor de la TRM ---
  // BehaviorSubject para almacenar internamente el valor extraído.
  private trmValueSubject = new BehaviorSubject<string | null>(null);
  
  // Observable público para que los componentes se suscriban al valor.
  public trmValue$: Observable<string | null> = this.trmValueSubject.asObservable();
  // ---

  widgetLoaded$: Observable<boolean> = this.widgetLoadedSubject.asObservable();
  loading$: Observable<boolean> = this.loadingSubject.asObservable();

  private scriptLoaded = false;
  private widgetHtml: string | null = null;
  private originalDocWrite: any;

  loadWidget(container: HTMLElement): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!container) {
        return reject(new Error('Widget container not found'));
      }

      this.loadingSubject.next(true);

      // Si ya tenemos el HTML, lo inyectamos directamente.
      // El valor ya fue extraído en la primera carga.
      if (this.widgetHtml !== null) {
        container.innerHTML = this.widgetHtml;
        this.loadingSubject.next(false);
        this.widgetLoadedSubject.next(true);
        return resolve();
      }
      
      if (this.scriptLoaded) {
          return reject(new Error('Widget is already in the process of loading.'));
      }

      this.widgetLoadedSubject.next(false);
      container.innerHTML = '';
      this.widgetHtml = '';

      this.originalDocWrite = document.write.bind(document);

      // Sobrescribimos document.write para capturar el contenido.
      (document as any).write = (content: string) => {
        this.widgetHtml += content;
        container.innerHTML = this.widgetHtml || '<p>Error al cargar</p>';

        // ✅ Llamamos a la función de extracción cada vez que se escribe contenido.
        this.extractAndStoreTrmValue(content);
      };

      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = `https://widgets.wilkinsonpc.com.co/curr/curr-usd-cop4.js?t=${Date.now()}`;

      script.onload = () => {
        this.restoreDocumentWrite();
        this.loadingSubject.next(false);
        this.widgetLoadedSubject.next(true);
        this.scriptLoaded = true;
        resolve();
      };

      script.onerror = () => {
        this.restoreDocumentWrite();
        this.loadingSubject.next(false);
        this.widgetHtml = null;
        this.trmValueSubject.next(null); // Reseteamos el valor en caso de error.
        reject(new Error('Failed to load TRM widget'));
      };

      document.head.appendChild(script);
    });
  }

  /**
   * ✅ Nuevo método para extraer el valor de la TRM usando una expresión regular.
   * @param htmlContent El string de HTML que se recibe de document.write.
   */
  private extractAndStoreTrmValue(htmlContent: string): void {
    // La expresión regular busca un patrón como: $3,960.94
    // - \$: Busca el símbolo de dólar literal.
    // - ( ... ): Inicia un grupo de captura.
    // - [\d,]+: Busca uno o más dígitos (0-9) o comas.
    // - \.: Busca el punto decimal literal.
    // - \d{2}: Busca exactamente dos dígitos (los centavos).
    const regex = /\$([\d,]+\.\d{2})/;
    const match = htmlContent.match(regex);

    // Si se encuentra una coincidencia (match no es null), match[0] contendrá el texto completo "$3,960.94".
    if (match && match[0]) {
      const extractedValue = match[0];

      // Solo actualizamos el BehaviorSubject si el valor encontrado es diferente al actual,
      // para evitar emisiones innecesarias.
      if (this.trmValueSubject.getValue() !== extractedValue) {
        this.trmValueSubject.next(extractedValue);
        console.log(`✅ Valor de la TRM extraído: ${extractedValue}`);
      }
    }
  }

  private restoreDocumentWrite(): void {
    if (this.originalDocWrite) {
      (document as any).write = this.originalDocWrite;
      this.originalDocWrite = null;
    }
  }

  cleanup(): void {
    this.restoreDocumentWrite();
  }
}
