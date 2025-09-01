// src/app/services/quotation/quotation.types.ts

// Define los enumeradores y las interfaces que coincidan con tu backend
export enum QuotationStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

export interface QuotationDetail {
  id?: string;
  quotation_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  discount: number;
  subtotal: number;
  taxes: number;
}

export interface Quotation {
  id: string;
  company_id: string;
  user_id: string;
  creation_date: Date;
  expiration_date: Date;
  validity_days: number;
  term: string;
  creation_mode: string;
  created_by: string;
  edited_by?: string;
  status: QuotationStatus;
  total: number;
}

export interface CreateQuotationDto {
  company_id: string;
  user_id: string;
  validity_days: number;
  term: string;
  creation_mode: string;
  created_by: string;
}

export interface UpdateQuotationDto {
  company_id?: string;
  user_id?: string;
  validity_days?: number;
  term?: string;
  edited_by?: string;
}

export interface CreateQuotationDetailDto {
  product_id: string;
  quantity: number;
  unit_price: number;
  discount: number;
  subtotal: number;
  taxes: number;
}

export interface CreateFullQuotationDto {
  quotation: CreateQuotationDto;
  details: CreateQuotationDetailDto[];
}
