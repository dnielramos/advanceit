import { ProductoFinal } from "../models/Productos";

export const PRODUCTOS_DEFAULT: ProductoFinal[] = [
  {
    id: '1',
    SKU: 'LAT5450',
    nombre: 'Latitude 5450 Portátil',
    descripcion:
      'Intel® Core™ i7-1370P, vPro® de 13.ª generación (14 núcleos, hasta 5,2 GHz de frecuencia Turbo)',
    precio: 1499.99,
    descuentos: false,
    estado: 'available',
    disponibilidad: true,
    moneda: 'USD',
    ultima_actualizacion: new Date(),
    fecha_creacion: new Date('2025-01-15'),
    creado_por: 'admin',
    mejorado: true,
    imagen: '/products/notebook-latitude-14-5440-nt-gray-gallery-2.avif',
    marca: 'Dell',
    categoria: 'Computadoras',
    subcategoria: 'Portátiles',
    cantidad: 10,
    warehouse: 'Principal',
    warehouseId: 'WH-001',
    precioRetail: 1599.99,
    etiquetas: ['Nuevo', 'Popular'],
    galleryImages: [
      '/products/notebook-latitude-14-5440-nt-gray-gallery-1.avif',
      '/products/notebook-latitude-14-5440-nt-gray-gallery-3.avif'
    ],
    especificaciones_tecnicas: {
      Procesador: {
        Modelo: 'Intel® Core™ Ultra 5 135U, vPro®',
        Núcleos: '14',
        Frecuencia: 'Hasta 5.2 GHz'
      },
      Pantalla: {
        Tamaño: '14.0"',
        Resolución: '1920x1080 Full HD'
      },
      Memoria: {
        RAM: '16 GB DDR5',
        Almacenamiento: '512 GB SSD'
      }
    },
    garantia_e_informacion_adicional: {
      Garantía: '3 años limitada',
      Soporte: 'Dell ProSupport'
    }
  },
  {
    id: '2',
    SKU: 'LAT7450',
    nombre: 'Latitude 7450 Laptop or 2-in-1',
    descripcion:
      '14-inch premium AI laptop or 2-in-1 featuring 16:10 displays, enhanced audio, ultralight option and Intel® Core™ Ultra processor.',
    precio: 999.99,
    descuentos: true,
    estado: 'available',
    disponibilidad: true,
    moneda: 'USD',
    ultima_actualizacion: new Date(),
    fecha_creacion: new Date('2025-02-02'),
    creado_por: 'admin',
    mejorado: false,
    imagen: '/products/notebook-latitude-14-7450-t-gray-gallery-1.avif',
    marca: 'Dell',
    categoria: 'Computadoras',
    subcategoria: 'Portátiles',
    cantidad: 5,
    warehouse: 'Secundario',
    warehouseId: 'WH-002',
    precioRetail: 1099.99,
    etiquetas: ['Nuevo'],
    galleryImages: [
      '/products/notebook-latitude-14-7450-t-gray-gallery-2.avif',
      '/products/notebook-latitude-14-7450-t-gray-gallery-3.avif'
    ],
    especificaciones_tecnicas: {
      Procesador: {
        Modelo: 'Intel® Core™ Ultra 7 165U, vPro®',
        Núcleos: '16',
        Frecuencia: 'Hasta 5.4 GHz'
      },
      Pantalla: {
        Tamaño: '14.0"',
        Resolución: '1920x1200 FHD+'
      },
      Memoria: {
        RAM: '16 GB LPDDR5X',
        Almacenamiento: '256 GB SSD'
      }
    },
    garantia_e_informacion_adicional: {
      Garantía: '2 años',
      Convertible: 'Sí, modo tablet'
    }
  },
  {
    id: '3',
    SKU: 'DWH5024',
    nombre: 'Dell Pro Wired ANC Headset - WH5024',
    descripcion:
      'Elevate your workday communication with this headset equipped with AI-based microphone and Active Noise Cancellation.',
    precio: 199.99,
    descuentos: false,
    estado: 'available',
    disponibilidad: true,
    moneda: 'USD',
    ultima_actualizacion: new Date(),
    fecha_creacion: new Date('2025-03-01'),
    creado_por: 'admin',
    mejorado: false,
    imagen: '/products/accessories-dell-wh5024-anc-bk-gallery-1.avif',
    marca: 'Dell',
    categoria: 'Accesorios',
    subcategoria: 'Audio',
    cantidad: 20,
    warehouse: 'Principal',
    warehouseId: 'WH-001',
    precioRetail: 229.99,
    etiquetas: ['Recomendado', 'Sonido'],
    galleryImages: [
      '/products/accessories-dell-wh5024-anc-bk-gallery-2.avif'
    ],
    especificaciones_tecnicas: {
      Conectividad: {
        Tipo: 'Cable',
        Compatibilidad: 'Win11/10, Mac OS'
      },
      Audio: {
        Certificaciones: 'Microsoft Teams, Zoom'
      }
    },
    garantia_e_informacion_adicional: {
      Garantía: '3 años',
      Característica: 'Cancelación activa de ruido'
    }
  },
  {
    id: '4',
    SKU: 'P2425H',
    nombre: 'Dell Pro 24 Plus Monitor - P2425H',
    descripcion: 'Monitor IPS 23.8" con resolución 1920x1080 y múltiples ajustes ergonómicos.',
    precio: 399.99,
    descuentos: false,
    estado: 'available',
    disponibilidad: true,
    moneda: 'USD',
    ultima_actualizacion: new Date(),
    fecha_creacion: new Date('2025-04-10'),
    creado_por: 'admin',
    mejorado: true,
    imagen: '/products/monitor-p2425h-black-gallery-2.avif',
    marca: 'Dell',
    categoria: 'Monitores',
    subcategoria: 'IPS',
    cantidad: 15,
    warehouse: 'Principal',
    warehouseId: 'WH-003',
    precioRetail: 449.99,
    etiquetas: ['Nuevo'],
    galleryImages: [
      '/products/monitor-p2425h-black-gallery-1.avif'
    ],
    especificaciones_tecnicas: {
      Pantalla: {
        Tipo: 'IPS',
        Resolución: '1920x1080',
        Tamaño: '23.8"'
      },
      Ergonomía: {
        Ajustes: 'Altura, Inclinación, Giro, Pivot'
      }
    },
    garantia_e_informacion_adicional: {
      Garantía: '3 años',
      Montura: 'VESA'
    }
  },
  {
    id: '5',
    SKU: 'WD25',
    nombre: 'Dell Pro Dock - WD25',
    descripcion:
      'Dock profesional con hasta 100W de entrega de energía y múltiples puertos de conexión.',
    precio: 129.99,
    descuentos: true,
    estado: 'available',
    disponibilidad: true,
    moneda: 'USD',
    ultima_actualizacion: new Date(),
    fecha_creacion: new Date('2025-04-20'),
    creado_por: 'admin',
    mejorado: false,
    imagen: '/products/dock-station-wd25-black-gallery-1.avif',
    marca: 'Dell',
    categoria: 'Accesorios',
    subcategoria: 'Docking',
    cantidad: 8,
    warehouse: 'Secundario',
    warehouseId: 'WH-004',
    precioRetail: 149.99,
    etiquetas: ['Popular'],
    galleryImages: [
      '/products/dock-station-wd25-black-gallery-2.avif'
    ],
    especificaciones_tecnicas: {
      Energía: {
        Dell: '100W',
        Otros: '96W'
      },
      Conectividad: {
        Ethernet: 'RJ45 2.5GbE'
      }
    },
    garantia_e_informacion_adicional: {
      Garantía: '3 años',
      Soporte: 'Ampliable a 5 años'
    }
  },
  {
    id: '6',
    SKU: 'KM7321W',
    nombre: 'Dell Premier Multi-Device Wireless Keyboard and Mouse – KM7321W',
    descripcion:
      'Combo premium de teclado y mouse inalámbricos con larga duración de batería (hasta 36 meses).',
    precio: 59.99,
    descuentos: true,
    estado: 'available',
    disponibilidad: true,
    moneda: 'USD',
    ultima_actualizacion: new Date(),
    fecha_creacion: new Date('2025-05-05'),
    creado_por: 'admin',
    mejorado: true,
    imagen: '/products/km7321w-xkb-01-gy.avif',
    marca: 'Dell',
    categoria: 'Accesorios',
    subcategoria: 'Periféricos',
    cantidad: 25,
    warehouse: 'Principal',
    warehouseId: 'WH-005',
    precioRetail: 79.99,
    etiquetas: ['Oferta', 'Popular'],
    galleryImages: [
      '/products/km7321w-xkb-02-gy.avif'
    ],
    especificaciones_tecnicas: {
      Conexión: {
        Tipo: 'USB receptor inalámbrico',
        DPI: '1000, 1600, 2400, 4000'
      },
      Teclado: {
        Teclas: '12 programables (F1-F12)'
      }
    },
    garantia_e_informacion_adicional: {
      Garantía: '2 años',
      Batería: 'Hasta 36 meses'
    }
  }
];
