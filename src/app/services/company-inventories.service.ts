// src/app/services/company-inventories.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { ENVIRONMENT } from '../../enviroments/enviroment';

export interface InventoryPayload {
  company: string;
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
  private readonly apiUrl = `${ENVIRONMENT.apiUrl}/company-inventories`;
  private readonly MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB en bytes
  private uploadProgress$ = new Subject<UploadProgress>();

  constructor(private http: HttpClient) {}

  // CREATE
  createInventory(payload: InventoryPayload): Observable<any> {
    return this.http.post(`${this.apiUrl}`, payload);
  }

  // READ - ALL
  getAllInventories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}`);
  }

  // READ - BY COMPANY
  getInventoryByCompany(company: string): Observable<any[]> {
    const params = new HttpParams().set('company', company);
    return this.http.get<any[]>(`${this.apiUrl}/by-company`, { params });
  }

  // READ - BY ID
  getInventoryById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // UPDATE
  updateInventory(id: string, newData: any, updatedBy: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, { newData, updatedBy });
  }

  // DELETE
  deleteInventory(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
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
