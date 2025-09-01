export enum QuotationStatus {
  SENT = 'sent',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

export enum CreationMode {
  CART = 'cart',
  PANEL = 'panel',
}

export interface Quotation {
  id: string;
  company_id: string;
  user_id: string;
  creation_date: Date;
  expiration_date: Date;
  validity_days: number;
  term: string;
  status: QuotationStatus;
  creation_mode: CreationMode;
  created_by: string;
  total: number;
  edited_by?: string;
  approved_by?: string;
}

export interface QuotationDetail {
  id: string;
  quotation_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  discount: number;
  subtotal: number;
  taxes: number;
}

export type CreateQuotationDto = Omit<
  Quotation,
  | 'id'
  | 'creation_date'
  | 'expiration_date'
  | 'status'
  | 'edited_by'
  | 'approved_by'
>;

export type UpdateQuotationDto = Partial<
  Omit<Quotation, 'id' | 'creation_date' | 'total'>
>;

export type CreateQuotationDetailDto = Omit<
  QuotationDetail,
  'id' | 'quotation_id'
>;

export interface CreateFullQuotationDto {
  quotation: CreateQuotationDto;
  details: CreateQuotationDetailDto[];
}
