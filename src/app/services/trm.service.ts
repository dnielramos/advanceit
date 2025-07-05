// trm.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TrmService {
  private widgetLoadedSubject = new BehaviorSubject<boolean>(false);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  widgetLoaded$: Observable<boolean> = this.widgetLoadedSubject.asObservable();
  loading$: Observable<boolean> = this.loadingSubject.asObservable();

  // ✅ Estados clave para la nueva lógica
  private scriptLoaded = false;
  private widgetHtml: string | null = null; // Para almacenar el HTML del widget

  private originalDocWrite: any;

  loadWidget(container: HTMLElement): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!container) {
        return reject(new Error('Widget container not found'));
      }

      this.loadingSubject.next(true);

      // --- LÓGICA DE REUTILIZACIÓN ---
      // Si ya tenemos el HTML guardado, lo inyectamos directamente y terminamos.
      if (this.widgetHtml !== null) {
        container.innerHTML = this.widgetHtml;
        this.loadingSubject.next(false);
        this.widgetLoadedSubject.next(true);
        return resolve();
      }

      // Si el script ya se está cargando, esperamos a que termine. (Prevención de race conditions)
      if (this.scriptLoaded) {
          // Opcional: Podríamos implementar una cola de espera aquí,
          // pero por ahora, simplemente rechazamos para evitar complejidad.
          return reject(new Error('Widget is already in the process of loading.'));
      }

      // --- LÓGICA DE PRIMERA CARGA ---
      this.widgetLoadedSubject.next(false);
      container.innerHTML = '';
      this.widgetHtml = ''; // Inicializamos la captura de HTML

      this.originalDocWrite = document.write.bind(document);

      // Sobrescribimos document.write para que guarde el HTML y lo muestre
      (document as any).write = (content: string) => {
        this.widgetHtml += content; // 👈 CAPTURAMOS el contenido
        container.innerHTML = this.widgetHtml || '<p>Error</p>'; // Lo mostramos en tiempo real
      };

      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = `https://widgets.wilkinsonpc.com.co/curr/curr-usd-cop4.js?t=${Date.now()}`;

      script.onload = () => {
        this.restoreDocumentWrite();
        this.loadingSubject.next(false);
        this.widgetLoadedSubject.next(true);
        this.scriptLoaded = true; // Marcamos que el script ya se ejecutó una vez
        resolve();
      };

      script.onerror = () => {
        this.restoreDocumentWrite();
        this.loadingSubject.next(false);
        this.widgetHtml = null; // Reseteamos si falla
        reject(new Error('Failed to load TRM widget'));
      };

      document.head.appendChild(script);
    });
  }

  private restoreDocumentWrite(): void {
    if (this.originalDocWrite) {
      (document as any).write = this.originalDocWrite;
      this.originalDocWrite = null;
    }
  }

  // El cleanup ya no necesita hacer casi nada
  cleanup(): void {
    this.restoreDocumentWrite();
  }
}
