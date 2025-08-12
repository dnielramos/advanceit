export interface ProductoFinal {
  id: string;
  sku: string;
  cantidad: string; // Puede ser string o number, ajusta según necesidad en el servicio
  estado: string; // Por ejemplo: 'available', 'out_of_stock', etc.
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string;
  marca: string;
  categoria: string;
  caracteristicas: string[];
  etiquetas: string[];
}
