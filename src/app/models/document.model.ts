// Opcional: puedes poner esto en un archivo separado, ej: 'document.models.ts'
import { Shipping } from './shipping.model';

/**
 * Define los datos necesarios para crear un nuevo documento.
 * Coincide con el @Body() esperado por createDocument.
 */
export interface CreateDocumentDto {
  shipping_id: string;
  document: string; // Asumo que 'document' es un string (ej. Base64 o una URL)
  type: string;
}

/**
 * Define la estructura del objeto Documento que la API retorna.
 * Coincide con el SELECT * FROM documentos.
 */
export interface ShippingDocument {
  id: string;
  shipping_id: string;
  document: string;
  type: string;
  created_at: string; // JSON usualmente convierte las Fechas a strings
}
