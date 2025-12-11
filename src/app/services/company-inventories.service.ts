// src/app/services/company-inventories.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ENVIRONMENT } from '../../enviroments/enviroment';
import { CacheService } from './cache.service';

export interface InventoryPayload {
  company_id: string;  // UUID de la empresa
  inventory: any[];
  created_by?: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  progress: number;
}

@Injectable({
  providedIn: 'root',
})
export class CompanyInventoriesService {
  private readonly apiUrl = `${ENVIRONMENT.apiUrlRender}/company-inventories`;
  // TTL por defecto para GET caches (ms)
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutos por defecto
  private readonly MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB en bytes
  private uploadProgress$ = new Subject<UploadProgress>();

  constructor(private http: HttpClient, private cache: CacheService) {}

  // CREATE
  createInventory(payload: InventoryPayload): Observable<any> {
    return this.http.post(`${this.apiUrl}`, payload).pipe(
      tap((res: any) => {
        // Invalidar listas que podrían verse afectadas
        this.cache.invalidate(`${this.apiUrl}::all`);
        this.cache.invalidate(`${this.apiUrl}/by-company`, true);
        // Si la API devuelve el id del nuevo inventario, invalidar su clave
        if (res && res.id) this.cache.invalidate(`${this.apiUrl}/${res.id}`);
      })
    );
  }

  // READ - ALL
  // forceRefresh = true -> ignora cache y rehace la petición
  getAllInventories(forceRefresh = false): Observable<any[]> {
    const key = `${this.apiUrl}::all`;
    if (forceRefresh) this.cache.invalidate(key);
    const fetch$ = this.http.get<any[]>(`${this.apiUrl}`);
    return this.cache.getOrFetch<any[]>(key, fetch$, this.DEFAULT_TTL);
  }

  // READ - BY COMPANY
  // Se cachea por company. forceRefresh para invalidar.
  getInventoryByCompany(company: string, forceRefresh = false): Observable<any[]> {
    const params = new HttpParams().set('company', company);
    const key = `${this.apiUrl}/by-company::company=${company}`;
    if (forceRefresh) this.cache.invalidate(key);
    const fetch$ = this.http.get<any[]>(`${this.apiUrl}/by-company`, { params });
    return this.cache.getOrFetch<any[]>(key, fetch$, this.DEFAULT_TTL);
  }

  // READ - BY ID
  getInventoryById(id: string, forceRefresh = false): Observable<any> {
    const key = `${this.apiUrl}/${id}`;
    if (forceRefresh) this.cache.invalidate(key);
    const fetch$ = this.http.get<any>(`${this.apiUrl}/${id}`);
    return this.cache.getOrFetch<any>(key, fetch$, this.DEFAULT_TTL);
  }

  // UPDATE
  updateInventory(id: string, newData: any, updatedBy: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, { newData, updatedBy }).pipe(
      tap(() => {
        // Invalidar cache relacionada
        this.cache.invalidate(`${this.apiUrl}/${id}`);
        this.cache.invalidate(`${this.apiUrl}::all`);
        this.cache.invalidate(`${this.apiUrl}/by-company`, true);
      })
    );
  }

  // DELETE
  deleteInventory(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.cache.invalidate(`${this.apiUrl}/${id}`);
        this.cache.invalidate(`${this.apiUrl}::all`);
        this.cache.invalidate(`${this.apiUrl}/by-company`, true);
      })
    );
  }

  // ============================================
  // Operaciones Granulares de Items
  // ============================================

  /**
   * Agregar items a un inventario existente
   * POST /company-inventories/:id/items
   */
  addItemsToInventory(inventoryId: string, items: any[], updatedBy: string = 'system'): Observable<any> {
    return this.http.post(`${this.apiUrl}/${inventoryId}/items`, { items, updated_by: updatedBy }).pipe(
      tap(() => {
        // Invalidar cache del inventario específico y listado
        this.cache.invalidate(`${this.apiUrl}/${inventoryId}`);
        this.cache.invalidate(`${this.apiUrl}::all`);
      })
    );
  }

  /**
   * Actualizar un item específico por índice
   * PATCH /company-inventories/:id/items/:itemIndex
   */
  updateItemByIndex(inventoryId: string, itemIndex: number, item: any, updatedBy: string = 'system'): Observable<any> {
    console.log('✏️ Service updateItemByIndex:', {
      url: `${this.apiUrl}/${inventoryId}/items/${itemIndex}`,
      body: { item, updated_by: updatedBy }
    });
    
    return this.http.patch(`${this.apiUrl}/${inventoryId}/items/${itemIndex}`, { item, updated_by: updatedBy }).pipe(
      tap(() => {
        this.cache.invalidate(`${this.apiUrl}/${inventoryId}`);
        this.cache.invalidate(`${this.apiUrl}::all`);
      })
    );
  }

  /**
   * Eliminar un item específico por índice
   * DELETE /company-inventories/:id/items/:itemIndex
   * 
   * Nota: Usamos request() en lugar de delete() para poder enviar body
   */
  deleteItemByIndex(inventoryId: string, itemIndex: number, updatedBy: string = 'system'): Observable<any> {
    console.log('🗑️ Service deleteItemByIndex:', {
      url: `${this.apiUrl}/${inventoryId}/items/${itemIndex}`,
      body: { updated_by: updatedBy }
    });
    
    // Usar http.request para poder enviar body en DELETE
    return this.http.request('DELETE', `${this.apiUrl}/${inventoryId}/items/${itemIndex}`, {
      body: { updated_by: updatedBy }
    }).pipe(
      tap(() => {
        this.cache.invalidate(`${this.apiUrl}/${inventoryId}`);
        this.cache.invalidate(`${this.apiUrl}::all`);
      })
    );
  }

  // ============================================
  // Validación y manejo de archivos
  // ============================================

  /**
   * Valida si el archivo cumple con los requisitos
   * @param file Archivo a validar
   * @returns Objeto con validación y mensaje de error si aplica
   */
  validateFile(file: File): { isValid: boolean; error?: string } {
    // Validar tamaño máximo (50 MB)
    if (file.size > this.MAX_FILE_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      const maxMB = (this.MAX_FILE_SIZE / (1024 * 1024)).toFixed(0);
      return {
        isValid: false,
        error: `El archivo es demasiado grande (${sizeMB} MB). El máximo permitido es ${maxMB} MB.`,
      };
    }

    // Validar extensión de archivo
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileName = file.name.toLowerCase();
    const hasValidExtension = validExtensions.some((ext) =>
      fileName.endsWith(ext)
    );

    if (!hasValidExtension) {
      return {
        isValid: false,
        error: `Formato de archivo no válido. Acepta: ${validExtensions.join(', ')}`,
      };
    }

    return { isValid: true };
  }

  /**
   * Calcula el progreso de carga en bytes/MB
   */
  getUploadProgress(): Observable<UploadProgress> {
    return this.uploadProgress$.asObservable();
  }

  /**
   * Simula progreso de descarga para lectura de archivo
   */
  updateProgress(loaded: number, total: number): void {
    const progress = (loaded / total) * 100;
    this.uploadProgress$.next({ loaded, total, progress });
  }

  /**
   * Obtiene información legible del tamaño del archivo
   */
  getReadableFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}
