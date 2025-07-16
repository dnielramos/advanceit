// product-catalog.component.ts
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faSearch,
  faShoppingCart,
  faTag,
  faStore,
  faHeart,
  faFilter,
} from '@fortawesome/free-solid-svg-icons';
import { trigger, transition, style, animate } from '@angular/animations';
import { ApiDetailsResponse, ProductAdvance } from '../../../models/ingram'; // Asegúrate de que ProductAdvance sea compatible o ajusta.
import { Subscription } from 'rxjs';
import { AdvanceProductsService } from '../../../services/product.service';

interface Product {
  _sku: string;
  product: {
    id: string;
    SKU: string;
    nombre: string;
    descripcion: string;
    precio: number;
    descuentos: boolean;
    estado: string;
    disponibilidad: boolean;
    imagen: string;
    marca: string;
    categoria: string;
    cantidad: number;
    warehouse?: string; // Hago opcional porque no está en tus datos de ejemplo de API
    warehouseId?: string; // Hago opcional porque no está en tus datos de ejemplo de API
    precioRetail?: number; // Hago opcional porque no está en tus datos de ejemplo de API
    etiquetas: string[];
  };
  details?: {
    titulo?: string;
    categorias?: string[];
    descripcion?: string;
    imagenes?: string[];
    etiquetas?: string;
    especificaciones_tecnicas?: Record<string, any>;
    garantia_e_informacion_adicional?: Record<string, string>;
  };
}

// Interfaz para el formato de los datos que realmente estás recibiendo de la API
interface FlatProductApi {
  id: string;
  sku: string;
  cantidad: string; // Puede ser string o number, ajusta según necesidad en el servicio
  estado: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string;
  marca: string;
  categoria: string;
  caracteristicas: string[];
  etiquetas: string[];
}

@Component({
  selector: 'app-advance-product',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './advance-products.component.html',
  styles: `
    .loader {
      height: 4px;
      width: 130px;
      --c: no-repeat linear-gradient(#6100ee 0 0);
      background: var(--c), var(--c), #d7b8fc;
      background-size: 60% 100%;
      animation: l16 3s infinite;
      border-radius: 100px;
    }

    @keyframes l16 {
      0% {
        background-position: -150% 0, -150% 0;
      }
      66% {
        background-position: 250% 0, -150% 0;
      }
      100% {
        background-position: 250% 0, 250% 0;
      }
    }
  `,
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms', style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class AdvanceProductsComponent implements OnInit, OnDestroy {
  // Iconos de FontAwesome
  faSearch = faSearch;
  faShoppingCart = faShoppingCart;
  faTag = faTag;
  faStore = faStore;
  faHeart = faHeart;
  faFilter = faFilter;

  // Datos
  allProducts: Product[] = [];
  filteredProducts = signal<Product[]>([]);

  // apiDetailsResponse: ApiDetailsResponse<ProductAdvance>[] = []; // Ya no parece ser necesaria con el nuevo formato.
  private productsSubscription?: Subscription;

  constructor(private advanceProductService: AdvanceProductsService) {}

  // Estados UI
  searchTerm : string = '';
  selectedCategories: string[] = [];
  selectedBrands: string[] = [];
  showCategoryFilter = signal(false);
  showBrandFilter = signal(false);
  activeImageIndexes: Record<string, number> = {};

  // Mensajes de bienvenida
  welcomeMessages = [
    '¡Descubre lo último en tecnología!',
    '¡Ofertas especiales solo por hoy!',
    'Envío gratis en compras superiores a $100',
    '¡Encuentra el producto perfecto para ti!',
    '¡Bienvenido a la mejor tienda de tecnología!',
    'Tecnología de vanguardia a precios increíbles',
    '¡Compra ahora y recibe tu producto mañana!',
    'La calidad que buscas, al precio que deseas',
  ];
  welcomeMessage = signal('');

  ngOnInit() {
    this.loadProducts();
    this.setRandomWelcomeMessage();

    setInterval(() => {
      this.setRandomWelcomeMessage();
    }, 5000);
  }

  ngOnDestroy(): void {
    if (this.productsSubscription) {
      this.productsSubscription.unsubscribe();
    }
  }

  setRandomWelcomeMessage() {
    const randomIndex = Math.floor(Math.random() * this.welcomeMessages.length);
    this.welcomeMessage.set(this.welcomeMessages[randomIndex]);
  }

  loadProducts(): void {
    this.productsSubscription = this.advanceProductService
      .getAllProducts()
      .subscribe({
        next: (batchOfProducts: FlatProductApi[]) => {
          // Mapeamos los datos recibidos al formato 'Product'
          const mappedProducts: Product[] = batchOfProducts.map((p ) => ({
            _sku: p.sku,
            product: {
              id: p.id,
              SKU: p.sku,
              nombre: p.nombre,
              descripcion: p.descripcion,
              precio: p.precio,
              descuentos: false, // Asumiendo false, ya que no está en el formato plano
              estado: p.estado,
              disponibilidad: p.estado === 'available', // Basado en el estado
              imagen: p.imagen,
              marca: p.marca,
              categoria: p.categoria,
              cantidad: parseFloat(p.cantidad), // Convertir a number
              etiquetas: p.etiquetas || [],
            },
            details: {
              titulo: p.nombre,
              categorias: [p.categoria], // Puedes expandir esto si las categorías vienen de forma más granular
              descripcion: p.descripcion,
              imagenes: [p.imagen], // Puedes añadir más imágenes si tu API las proporciona
              etiquetas: p.etiquetas.join(', '), // Unir las etiquetas en un string si es necesario
              // No hay especificaciones_tecnicas ni garantia_e_informacion_adicional en el formato plano
            },
          }));

          this.allProducts = mappedProducts;
          this.filteredProducts.set([...this.allProducts]);
          console.log(
            'Lote de productos recibido y mapeado:',
            this.allProducts
          );

          this.allProducts.forEach((product) => {
            this.activeImageIndexes[product._sku] = 0;
          });
        },
        error: (error) => {
          console.error('Error al cargar los productos:', error);
        },
        complete: () => {
          console.log('Todos los productos cargados.');
        },
      });
  }

  // Métodos para manejar filtros
  filterProducts() {
    let results = [...this.allProducts];

    // Filtrar por término de búsqueda
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      results = results.filter((item) => {
        const title = this.getProductTitle(item).toLowerCase();
        const description = this.getProductDescription(item).toLowerCase();
        const brand = item.product.marca.toLowerCase();
        const sku = item.product.SKU.toLowerCase();
        // const categories = this.getProductCategories(item).map((cat) =>
        //   cat.toLowerCase()
        // );
        // const tags = this.getProductTags(item).map((tag) => tag.toLowerCase());

        return (
          title.includes(term) ||
          description.includes(term) ||
          brand.includes(term) ||
          sku.includes(term)
          // categories.some((cat) => cat.includes(term)) ||
          // tags.some((tag) => tag.includes(term))
        );
      });
    }

    // Filtrar por categorías seleccionadas
    if (this.selectedCategories.length > 0) {
      results = results.filter((item) => {
        const categories = this.getProductCategories(item);
        return this.selectedCategories.some((cat) => categories.includes(cat));
      });
    }

    // Filtrar por marcas seleccionadas
    if (this.selectedBrands.length > 0) {
      results = results.filter((item) =>
        this.selectedBrands.includes(item.product.marca)
      );
    }

    this.filteredProducts.set(results);
  }

  resetFilters() {
    this.searchTerm = '';
    this.selectedCategories = [];
    this.selectedBrands = [];
    this.filteredProducts.set([...this.allProducts]);
    this.showCategoryFilter.set(false);
    this.showBrandFilter.set(false);
  }

  // Métodos para manejar filtros de categorías
  toggleCategoryFilter() {
    this.showCategoryFilter.set(!this.showCategoryFilter());
    if (this.showCategoryFilter()) {
      this.showBrandFilter.set(false);
    }
  }

  uniqueCategories(): string[] {
    const categoriesSet = new Set<string>();

    this.allProducts.forEach((item) => {
      const categories = this.getProductCategories(item);
      categories.forEach((cat) => categoriesSet.add(cat));
    });

    return Array.from(categoriesSet);
  }

  toggleCategory(category: string) {
    const index = this.selectedCategories.indexOf(category);
    if (index > -1) {
      this.selectedCategories.splice(index, 1);
    } else {
      this.selectedCategories.push(category);
    }
    this.filterProducts();
  }

  clearCategoryFilters() {
    this.selectedCategories = [];
    this.filterProducts();
  }

  // Métodos para manejar filtros de marcas
  toggleBrandFilter() {
    this.showBrandFilter.set(!this.showBrandFilter());
    if (this.showBrandFilter()) {
      this.showCategoryFilter.set(false);
    }
  }

  uniqueBrands(): string[] {
    const brandsSet = new Set<string>();

    this.allProducts.forEach((item) => {
      brandsSet.add(item.product.marca);
    });

    return Array.from(brandsSet);
  }

  toggleBrand(brand: string) {
    const index = this.selectedBrands.indexOf(brand);
    if (index > -1) {
      this.selectedBrands.splice(index, 1);
    } else {
      this.selectedBrands.push(brand);
    }
    this.filterProducts();
  }

  clearBrandFilters() {
    this.selectedBrands = [];
    this.filterProducts();
  }

  // Métodos para manejar las imágenes
  getProductImages(product: Product): string[] {
    // Si hay imágenes en details, usar esas, sino usar la imagen del product
    if (product.details?.imagenes && product.details.imagenes.length > 0) {
      return product.details.imagenes;
    }
    return [product.product.imagen];
  }

  hasMultipleImages(product: Product): boolean {
    return this.getProductImages(product).length > 1;
  }

  getImagesArray(product: Product): number[] {
    const imagesLength = this.getProductImages(product).length;
    return Array(imagesLength)
      .fill(0)
      .map((_, i) => i);
  }

  setActiveImage(sku: string, index: number) {
    this.activeImageIndexes[sku] = index;
  }

  getCurrentImageIndex(sku: string): number {
    return this.activeImageIndexes[sku] || 0;
  }

  getActiveImage(product: Product): string {
    const images = this.getProductImages(product);
    const index = this.getCurrentImageIndex(product._sku);
    return images[index];
  }

  // Métodos para obtener información del producto (con fallbacks)
  getProductTitle(product: Product): string {
    return product.product.nombre || product.details?.titulo || 'Producto sin título';
  }

  getProductDescription(product: Product): string {
    return product.details?.descripcion || product.product.descripcion;
  }

  getProductCategories(product: Product): string[] {
    if (product.details?.categorias && product.details.categorias.length > 0) {
      return product.details.categorias;
    }
    return [product.product.categoria];
  }

  getProductTags(product: Product): string[] {
    if (product.details?.etiquetas) {
      // Si es un string, convertirlo a array
      if (typeof product.details.etiquetas === 'string') {
        return product.details.etiquetas.split(',').map((tag) => tag.trim());
      }
    }
    return product.product.etiquetas || [];
  }
}
