// --- archivo: quotation.model.ts ---

import { QuotationStatus } from "./quotation.types";

/**
 * Representa la estructura de un usuario.
 */
interface User {
  id: string;
  name: string;
  email: string;
}

/**
 * Representa la estructura de una compañía.
 */
interface Company {
  id: number;
  razon_social: string;
  nit: string;
}

/**
 * Representa la cotización completa con todos los datos anidados ("poblados")
 * tal como la devuelve el API.
 */
export interface PopulatedQuotation {
  id: string;
  creation_date: string;     // O Date si lo transformas después
  expiration_date: string;   // O Date si lo transformas después
  validity_days: number;
  term: string;
  status: QuotationStatus; // Puedes ser más específico
  creation_mode: string;
  total: string;             // Es un string en el JSON, se puede convertir a número si es necesario

  // --- Objetos anidados ---
  company_id: Company | null;
  user_id: User | null;
  created_by: User | null;
  edited_by: User | null;    // Es nulable, ya que puede no haber sido editada
}
