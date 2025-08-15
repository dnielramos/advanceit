// export interface ProductoFinal {
//   id: string;
//   sku: string;
//   cantidad: string; // Puede ser string o number, ajusta según necesidad en el servicio
//   estado: string; // Por ejemplo: 'available', 'out_of_stock', etc.
//   nombre: string;
//   descripcion: string;
//   precio: number;
//   imagen: string;
//   marca: string;
//   categoria: string;
//   caracteristicas: string[];
//   etiquetas: string[];
// }

export interface ProductoFinal {
  id: string;
  SKU: string;
  nombre: string;
  descripcion: string;
  precio: number | null;
  descuentos: boolean;
  estado: string;
  disponibilidad: boolean;
  moneda: string;
  ultima_actualizacion: Date | null;
  fecha_creacion: Date | null;
  creado_por: string | null;
  mejorado: boolean;
  imagen: string;
  marca: string;
  categoria: string;
  subcategoria: string;
  cantidad: number;
  warehouse: string | null;
  warehouseId: string | null;
  precioRetail: number | string;
  etiquetas: string[];
  galleryImages: string[];
  especificaciones_tecnicas?: string[];
  garantia_e_informacion_adicional?: Record<string, string>;
  [key: string]: any; // Permite propiedades adicionales
}
