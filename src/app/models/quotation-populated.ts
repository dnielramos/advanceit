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
