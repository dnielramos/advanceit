import { Injectable, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { from, Observable, concat, BehaviorSubject } from 'rxjs';
import { bufferCount, concatMap, map, scan, delay } from 'rxjs/operators';

// Asegúrate de que la ruta al modelo sea correcta
import { ApiDetailsResponse, ProductAdvance } from '../models/ingram';
import { ProductoFinal } from '../models/Productos';
import { environment } from '../../enviroments/enviroment';

interface SaveBatchResponse {
  message: string;
}

export interface CategoryResponse {
  catalog: GroupedCategory[];
}

export interface GroupedCategory {
  category: string;
  subCategories: string[];
  [key: string] : any;
}

@Injectable({ providedIn: 'root' })
export class ProductsService implements OnInit {
  private readonly apiUrlRender = environment.apiUrlRender; // URL de tu API NestJS
  private API_PRODUCTS_URL = `${this.apiUrlRender}/advance-products/ingram`;
  private API_LIST_URL = `${this.apiUrlRender}/advance-products/all-products`;
  private API_CATEGORY_URL = `${this.apiUrlRender}/categories`;
  categorias: any = [];

  // BehaviorSubject para emitir el array de productos de forma progresiva
  private _allProducts$ = new BehaviorSubject<
    ApiDetailsResponse<ProductAdvance>[]
  >([]);
  public allProducts$: Observable<ApiDetailsResponse<ProductAdvance>[]> =
    this._allProducts$.asObservable();

  productos: ProductoFinal[] = [
    {
      id: '1',
      sku: 'LAT5450',
      cantidad: '10',
      estado: 'available',
      nombre: 'Latitude 5450 Portátil',
      descripcion:
        'Intel® Core™ i7-1370P, vPro® de 13.ª generación (14 núcleos, hasta 5,2 GHz de frecuencia Turbo)',
      precio: 1499.99,
      imagen: '/products/notebook-latitude-14-5440-nt-gray-gallery-2.avif',
      marca: 'Dell',
      categoria: 'Computadoras',
      caracteristicas: [
        'Intel® Core™ Ultra 5 135U, vPro®',
        'Windows 11 Pro',
        'Intel® Graphics',
        '16 GB DDR5 | 512 GB SSD | 14.0-in. display Full HD (1920X1080)',
      ],
      etiquetas: ['Nuevo', 'Popular'],
    },
    {
      id: '2',
      sku: 'LAT7450',
      cantidad: '5',
      estado: 'available',
      nombre: 'Latitude 7450 Laptop or 2-in-1',
      descripcion:
        '14-inch premium AI laptop or 2-in-1 featuring 16:10 displays, enhanced audio, ultralight option and Intel® Core™ Ultra processor.',
      precio: 999.99,
      imagen: '/products/notebook-latitude-14-7450-t-gray-gallery-1.avif',
      marca: 'Dell',
      categoria: 'Computadoras',
      caracteristicas: [
        'Intel® Core™ Ultra 7 165U, vPro®',
        'Windows 11 Pro',
        'Intel® Graphics',
        '16 GB LPDDR5X | 256 GB SSD | 14" Non-Touch FHD+ (1920x1200)',
      ],
      etiquetas: ['Nuevo'],
    },
    {
      id: '3',
      sku: 'DWH5024',
      cantidad: '20',
      estado: 'available',
      nombre: 'Dell Pro Wired ANC Headset - WH5024',
      descripcion:
        'Elevate your workday communication with this headset that comes equipped with an AI-based microphone and Active Noise Cancellation, designed to reduce background noise, ensure comfort, and bring your productivity to the next level.',
      precio: 199.99,
      imagen: '/products/accessories-dell-wh5024-anc-bk-gallery-1.avif',
      marca: 'Dell',
      categoria: 'Accesorios',
      caracteristicas: [
        'Microsoft Teams (Open Office) Certified, Zoom Certified',
        '3 Year Limited Hardware with Advanced Exchange Service',
        'Win11/10 64 Bit, Mac OS',
      ],
      etiquetas: ['Recomendado', 'Sonido'],
    },
    {
      id: '4',
      sku: 'P2425H',
      cantidad: '15',
      estado: 'available',
      nombre: 'Dell Pro 24 Plus Monitor - P2425H',
      descripcion: 'In-Plane Switching (IPS) technology | 1920 x 1080',
      precio: 399.99,
      imagen: '/products/monitor-p2425h-black-gallery-2.avif',
      marca: 'Dell',
      categoria: 'Monitores',
      caracteristicas: [
        'In-Plane Switching (IPS) technology',
        'Resolution / Refresh Rate 1920 x 1080',
        'Adjustability Height, Tilt, Swivel, Pivot',
        'Diagonal Size 23.8',
      ],
      etiquetas: ['Nuevo'],
    },
    {
      id: '5',
      sku: 'WD25',
      cantidad: '8',
      estado: 'available',
      nombre: 'Dell Pro Dock - WD25',
      descripcion:
        'Boost your productivity with the latest pro dock that offers up to 100W power delivery and a wide variety of connecting options.',
      precio: 129.99,
      imagen: '/products/dock-station-wd25-black-gallery-1.avif',
      marca: 'Dell',
      categoria: 'Accesorios',
      caracteristicas: [
        '100W (Dell systems) 96W (non-Dell systems)',
        'RJ45 Ethernet port, 2.5GbE',
        '3-Year Limited Hardware Warranty with Advanced Exchange Additional 4- & 5-year warranty optional',
      ],
      etiquetas: ['Popular'],
    },
    {
      id: '6',
      sku: 'KM7321W',
      cantidad: '25',
      estado: 'available',
      nombre: 'Dell Premier Multi-Device Wireless Keyboard and Mouse – KM7321W',
      descripcion:
        'Experience superior multitasking features with a stylish and comfortable premium keyboard and mouse combo. Complete your tasks powered by one of the industry’s leading battery lives at up to 36 months.',
      precio: 59.99,
      imagen: '/products/km7321w-xkb-01-gy.avif',
      marca: 'Dell',
      categoria: 'Accesorios',
      caracteristicas: [
        'USB wireless receiver',
        'Adjustable DPI. 1000, 1600(default), 2400, 4000',
        '12 programmable keys of F1-F12',
      ],
      etiquetas: ['Oferta', 'Popular'],
    },
  ];

  productosFavorites: ProductoFinal[] = [
    {
      id: '1',
      sku: 'LAT5450',
      cantidad: '10',
      estado: 'available',
      nombre: 'Latitude 5450 Portátil',
      descripcion:
        'Intel® Core™ i7-1370P, vPro® de 13.ª generación (14 núcleos, hasta 5,2 GHz de frecuencia Turbo)',
      precio: 1499.99,
      imagen: '/products/notebook-latitude-14-5440-nt-gray-gallery-2.avif',
      marca: 'Dell',
      categoria: 'Computadoras',
      caracteristicas: [
        'Intel® Core™ Ultra 5 135U, vPro®',
        'Windows 11 Pro',
        'Intel® Graphics',
        '16 GB DDR5 | 512 GB SSD | 14.0-in. display Full HD (1920X1080)',
      ],
      etiquetas: ['Nuevo', 'Popular'],
    },
    {
      id: '2',
      sku: 'LAT7450',
      cantidad: '5',
      estado: 'available',
      nombre: 'Latitude 7450 Laptop or 2-in-1',
      descripcion:
        '14-inch premium AI laptop or 2-in-1 featuring 16:10 displays, enhanced audio, ultralight option and Intel® Core™ Ultra processor.',
      precio: 999.99,
      imagen: '/products/notebook-latitude-14-7450-t-gray-gallery-1.avif',
      marca: 'Dell',
      categoria: 'Computadoras',
      caracteristicas: [
        'Intel® Core™ Ultra 7 165U, vPro®',
        'Windows 11 Pro',
        'Intel® Graphics',
        '16 GB LPDDR5X | 256 GB SSD | 14" Non-Touch FHD+ (1920x1200)',
      ],
      etiquetas: ['Nuevo'],
    },
    {
      id: '3',
      sku: 'DWH5024',
      cantidad: '20',
      estado: 'available',
      nombre: 'Dell Pro Wired ANC Headset - WH5024',
      descripcion:
        'Elevate your workday communication with this headset that comes equipped with an AI-based microphone and Active Noise Cancellation, designed to reduce background noise, ensure comfort, and bring your productivity to the next level.',
      precio: 199.99,
      imagen: '/products/accessories-dell-wh5024-anc-bk-gallery-1.avif',
      marca: 'Dell',
      categoria: 'Accesorios',
      caracteristicas: [
        'Microsoft Teams (Open Office) Certified, Zoom Certified',
        '3 Year Limited Hardware with Advanced Exchange Service',
        'Win11/10 64 Bit, Mac OS',
      ],
      etiquetas: ['Recomendado', 'Sonido'],
    },
    {
      id: '4',
      sku: 'P2425H',
      cantidad: '15',
      estado: 'available',
      nombre: 'Dell Pro 24 Plus Monitor - P2425H',
      descripcion: 'In-Plane Switching (IPS) technology | 1920 x 1080',
      precio: 399.99,
      imagen: '/products/monitor-p2425h-black-gallery-2.avif',
      marca: 'Dell',
      categoria: 'Monitores',
      caracteristicas: [
        'In-Plane Switching (IPS) technology',
        'Resolution / Refresh Rate 1920 x 1080',
        'Adjustability Height, Tilt, Swivel, Pivot',
        'Diagonal Size 23.8',
      ],
      etiquetas: ['Nuevo'],
    },
    {
      id: '5',
      sku: 'WD25',
      cantidad: '8',
      estado: 'available',
      nombre: 'Dell Pro Dock - WD25',
      descripcion:
        'Boost your productivity with the latest pro dock that offers up to 100W power delivery and a wide variety of connecting options.',
      precio: 129.99,
      imagen: '/products/dock-station-wd25-black-gallery-1.avif',
      marca: 'Dell',
      categoria: 'Accesorios',
      caracteristicas: [
        '100W (Dell systems) 96W (non-Dell systems)',
        'RJ45 Ethernet port, 2.5GbE',
        '3-Year Limited Hardware Warranty with Advanced Exchange Additional 4- & 5-year warranty optional',
      ],
      etiquetas: ['Popular'],
    },
    {
      id: '6',
      sku: 'KM7321W',
      cantidad: '25',
      estado: 'available',
      nombre: 'Dell Premier Multi-Device Wireless Keyboard and Mouse – KM7321W',
      descripcion:
        'Experience superior multitasking features with a stylish and comfortable premium keyboard and mouse combo. Complete your tasks powered by one of the industry’s leading battery lives at up to 36 months.',
      precio: 59.99,
      imagen: '/products/km7321w-xkb-01-gy.avif',
      marca: 'Dell',
      categoria: 'Accesorios',
      caracteristicas: [
        'USB wireless receiver',
        'Adjustable DPI. 1000, 1600(default), 2400, 4000',
        '12 programmable keys of F1-F12',
      ],
      etiquetas: ['Oferta', 'Popular'],
    },
  ];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // Aquí podrías inicializar algo si es necesario
    this.getAllCategories();
  }

  get getProductos() {
    return this.productos;
  }

  get getFavoritesProducts() {
    return this.productosFavorites;
  }

  /**
   * Envía un lote de productos a la API para ser guardados.
   * @param payload El lote de productos a guardar.
   * @returns Un Observable con la respuesta de la API.
   */
  // saveBatch(
  //   payload: ApiDetailsResponse<ProductAdvance>[]
  // ): Observable<SaveBatchResponse> {
  //   return this.http.post<SaveBatchResponse>(this.API_PRODUCTS_URL, payload);
  // }

  /**
   * Obtiene todos los productos de la API en lotes y los emite progresivamente.
   * @param batchSize El tamaño del lote para la carga progresiva (opcional, por defecto es 5).
   * @param delayTime El tiempo de espera entre emisiones de lotes (en ms, opcional, por defecto es 500ms).
   * @returns Un Observable que emite arrays de productos de forma progresiva.
   */
  loadAllProductsProgressively(
    batchSize: number = 10,
    delayTime: number = 500
  ): Observable<ApiDetailsResponse<ProductAdvance>[]> {
    return this.http
      .get<ApiDetailsResponse<ProductAdvance>[]>(this.API_LIST_URL)
      .pipe(
        // Convertir el array de productos inicial en un Observable
        concatMap((allProducts) => from(allProducts)),
        // Agrupar los productos en lotes
        bufferCount(batchSize),
        // Emitir cada lote con un retraso
        concatMap((batch) => from([batch]).pipe(delay(delayTime))),
        // Acumular los lotes emitidos en el BehaviorSubject
        scan((acc, batch) => {
          const updatedProducts = [...acc, ...batch];
          this._allProducts$.next(updatedProducts);
          return updatedProducts;
        }, [] as ApiDetailsResponse<ProductAdvance>[])
      );
  }

  /**
   * Devuelve un Observable con la lista completa de productos (se carga de una vez).
   * Útil si la carga progresiva ya se ha completado o para otros casos de uso.
   * @returns Un Observable con el array completo de productos.
   */
  getAllProducts(): Observable<ProductoFinal[]> {
    return this.http.get<ProductoFinal[]>(this.API_LIST_URL);
  }

  getAllCategories(): Observable<CategoryResponse> {
    const cats = this.http.get<CategoryResponse>(this.API_CATEGORY_URL);
    this.categorias = cats;
    return cats;
  }
}
