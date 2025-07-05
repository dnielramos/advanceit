export interface Producto {
  id: string; // Cambiamos el tipo de id a string para almacenar el UUID
  categoria: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string;
  marca: string;
  caracteristicas?: string[];
  etiquetas: string[];
}

export interface NexsysProduct {
  mark: string;
  parent: string;
  category: string;
  sku: string;
  name: string;
  price: number;
  currency: string;
  tax_excluded: string;
  inventory: string;
  short_description: string;
  long_description: string;
  image: string;
}
