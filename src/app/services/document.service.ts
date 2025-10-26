import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateDocumentDto, ShippingDocument } from '../models/document.model';
import { ENVIRONMENT } from '../../enviroments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {

  // Define la URL base de tu API de NestJS.
  // Es una MEJOR PRÁCTICA poner 'http://localhost:3000' en tu archivo environment.ts
  private apiUrl = `${ENVIRONMENT.apiUrlRender}/documents`;

  constructor(private http: HttpClient) { }

  /**
   * Obtiene un documento basado en su shipping_id.
   * Consume: GET /documents/by-shipping/:id
   *
   * @param id El UUID del shipping_id.
   * @returns Un Observable con el documento encontrado.
   */
  getDocumentByShippingId(id: string): Observable<ShippingDocument> {
    const url = `${this.apiUrl}/by-shipping/${id}`;
    return this.http.get<ShippingDocument>(url);
  }

  /**
   * Crea un nuevo documento.
   * Consume: POST /documents
   *
   * @param documentData Los datos del documento a crear (tipo CreateDocumentDto).
   * @returns Un Observable<void> ya que el controlador NestJS no retorna contenido (201 Created).
   */
  createDocument(documentData: CreateDocumentDto): Observable<void> {
    return this.http.post<void>(this.apiUrl, documentData);
  }
}
