import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { shareReplay, tap, finalize, catchError } from 'rxjs/operators';

interface CacheEntry<T = any> {
  expiry: number;
  value?: T;
  observable$?: Observable<T>;
}

@Injectable({ providedIn: 'root' })
export class CacheService {
  private cache = new Map<string, CacheEntry>();

  // Default TTL: 5 minutes
  readonly DEFAULT_TTL = 5 * 60 * 1000;

  /**
   * Intenta obtener un valor en cache; si existe y no expiró, devuelve observable con el valor.
   */
  get<T>(key: string): Observable<T> | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return undefined;
    }
    // Si hay un observable en curso, devuélvelo para evitar duplicados
    if (entry.observable$) return entry.observable$ as Observable<T>;
    return of(entry.value as T);
  }

  /**
   * Guarda un valor en cache con TTL.
   */
  set<T>(key: string, value: T, ttlMs = this.DEFAULT_TTL): void {
    const expiry = Date.now() + ttlMs;
    this.cache.set(key, { expiry, value });
  }

  /**
   * Obtiene desde cache o ejecuta la petición proporcionada y la cachea.
   * Deduplica llamadas concurrentes usando shareReplay.
   */
  getOrFetch<T>(
    key: string,
    fetch$: Observable<T>,
    ttlMs = this.DEFAULT_TTL
  ): Observable<T> {
    const existing = this.cache.get(key);
    if (existing) {
      if (Date.now() <= existing.expiry) {
        if (existing.observable$) return existing.observable$ as Observable<T>;
        return of(existing.value as T);
      }
      // expired
      this.cache.delete(key);
    }

    const shared$ = fetch$.pipe(
      // almacena el valor cuando llegue
      tap((v: T) => this.set(key, v, ttlMs)),
      // evitar recomputar para suscriptores concurrentes
      shareReplay({ bufferSize: 1, refCount: true }),
      catchError((err) => {
        // En caso de error, limpiar entrada para permitir reintentos
        this.cache.delete(key);
        throw err;
      }),
      finalize(() => {
        // Cuando termine (error o completo), si existe una entrada con observable$, lo removemos
        const e = this.cache.get(key);
        if (e && e.observable$) {
          // reemplazamos por la value si ya se almacenó
          if (e.value !== undefined) {
            delete e.observable$;
            this.cache.set(key, e);
          } else {
            this.cache.delete(key);
          }
        }
      })
    );

    // Guardar observable en cache para deduplicación de peticiones concurrentes
    this.cache.set(key, { expiry: Date.now() + ttlMs, observable$: shared$ });
    return shared$;
  }

  /**
   * Invalida una entrada por clave. Si se pasa un prefijo, borra por patrón.
   */
  invalidate(keyOrPrefix: string, isPrefix = false): void {
    if (!isPrefix) {
      this.cache.delete(keyOrPrefix);
      return;
    }
    for (const k of Array.from(this.cache.keys())) {
      if (k.startsWith(keyOrPrefix)) this.cache.delete(k);
    }
  }

  /**
   * Limpia toda la cache.
   */
  clear(): void {
    this.cache.clear();
  }
}
