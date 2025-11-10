// Modelos para RMA (Return Merchandise Authorization)

export interface Rma {
  id: string;
  rma_number: string;
  order_id: string;
  estado: string;
  motivo: string;
  evidencias: any[];
  notas: string | null;
  created_at: Date;
}

export interface CreateRmaDto {
  order_id: string;
  motivo: string;
  items: { product_id: string; quantity: number }[];
}

export interface UpdateRmaDataDto {
  motivo?: string;
  evidencias?: any[];
  notas?: string;
}

export interface UpdateRmaStateDto {
  nextState: string;
  notas?: string;
}
