// src/app/services/quotation/quotation.types.ts

import { User } from './user';

// Define los enumeradores y las interfaces que coincidan con tu backend

interface QuotationUser {
  id: string;
  name: string;
  email: string;
}

interface QuotationCompany{
  id: string;
  razon_social: string;
  nit: string;
  credit?: {
    has_credit: boolean;
    available_credit: number;
    total_credit: number;
    spent_credit: number;
  };
}

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

export interface ProductPreview {
  id: string;
  name: string;
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
  subtotal_productos?: number;
  porcentaje_descuento?: number;
  valor_descuento?: number;
  valor_logistica?: number;
  base_gravable?: number;
  porcentaje_iva?: number;
  valor_iva?: number;
}

interface PQuotation {
  id: string;
  company_id: string;
  user_id: string;
  creation_date: Date;
  expiration_date: Date;
  validity_days: number;
  term: string;
  creation_mode: string;
  created_by: QuotationUser;
  edited_by?: QuotationUser;
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
  total?: number;
  subtotal_productos?: number;
  porcentaje_descuento?: number;
  valor_descuento?: number;
  valor_logistica?: number;
  base_gravable?: number;
  porcentaje_iva?: number;
  valor_iva?: number;
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

export interface PopulatedQuotation {
  id: string;
  user: QuotationUser;
  user_id: string;
  company_id: string;
  company: QuotationCompany;
  creation_date: Date;
  expiration_date: Date;
  validity_days: number;
  term: string;
  creation_mode: string;
  created_by: QuotationUser;
  edited_by?: QuotationUser;
  status: QuotationStatus;
  total: number;
  details: QuotationDetail[];
  subtotal_productos?: number;
  porcentaje_descuento?: number;
  valor_descuento?: number;
  valor_logistica?: number;
  base_gravable?: number;
  porcentaje_iva?: number;
  valor_iva?: number;
}

export interface QuotationCalculations {
  subtotal_productos: number;
  porcentaje_descuento: number;
  valor_descuento: number;
  valor_logistica: number;
  base_gravable: number;
  porcentaje_iva: number;
  valor_iva: number;
  total: number;
}

export interface PreviewQuotationDto {
  company_id: string;
  user_id: string;
  products: {
    product_id: string;
    quantity: number;
    unit_price: number;
  }[];
  validity_days: number;
  term: string;
  creation_mode: string;
  created_by: string;
}

export interface PreviewQuotationResponse {
  company: {
    id: string;
    name: string;
    credit?: {
      has_credit: boolean;
      available_credit: number;
      total_credit: number;
      spent_credit: number;
    };
  };
  user: QuotationUser;
  products: ProductPreview[];
  expiration_date: string;
  validity_days: number;
  term: string;
  creation_mode: string;
  created_by: QuotationUser;
  calculations: QuotationCalculations;
}
