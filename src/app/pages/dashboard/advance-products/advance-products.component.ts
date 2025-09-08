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
import { Subscription } from 'rxjs';
import { ApiGetAllProductsResponse, ProductsService } from '../../../services/product.service';
import { ProductoFinal } from '../../../models/Productos'; // Interfaz correcta ya en uso
import { CartService } from '../../../services/cart.service';
import { AuthService, Role } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { GridProductsStoreComponent } from "../../../components/products/products-store/grid-products-store.component";
import { AngularToastifyModule, ToastService } from "angular-toastify";

@Component({
  selector: 'app-advance-product',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, GridProductsStoreComponent, AngularToastifyModule],
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

  cartItemCount = signal(0);
  islogged = signal(false);

  // Datos
  allProducts: ProductoFinal[] = [];
  filteredProducts = signal<ProductoFinal[]>([]);

  private productsSubscription?: Subscription;

  constructor(private productsService: ProductsService, private cartService: CartService, private authService: AuthService, private router: Router, private toastService: ToastService) {}

  // Estados UI
  searchTerm: string = '';
  selectedCategories: string[] = [];
  selectedBrands: string[] = [];
  showCategoryFilter = signal(false);
  showBrandFilter = signal(false);
  activeImageIndexes: Record<string, number> = {};

  // Mensajes de bienvenida
  welcomeMessages = [
    'Bienvenido a Advance',
    'Distribuidores autorizados Dell',
    'Distribuidores autorizados HP',
    'Distribuidores autorizados Lenovo',
    'Somos creadores del cambio',
  ];
  welcomeMessage = signal('');

  ngOnInit() {
    this.loadProducts();
    this.setRandomWelcomeMessage();
    this.cartService.getCart().subscribe((items) => {
      this.cartItemCount.set(items.length);
    });
    this.authService.isLoggedIn$.subscribe((isLoggedIn) => {
      this.islogged.set(isLoggedIn);
    });
    const interval = setInterval(() => this.setRandomWelcomeMessage(), 5000);
    this.ngOnDestroy = () => clearInterval(interval);
  }

  ngOnDestroy(): void {
    this.productsSubscription?.unsubscribe();
  }

  addToCart(product: ProductoFinal) {
    console.log(product);
    this.toastService.success(`Producto ${product.nombre} agregado al carrito`);
    this.cartService.addToCart(product);
  }

  goToCart() {
    this.router.navigate(['/dashboard/cart'])
  }

  setRandomWelcomeMessage() {
    const randomIndex = Math.floor(Math.random() * this.welcomeMessages.length);
    this.welcomeMessage.set(this.welcomeMessages[randomIndex]);
  }

  loadProducts(): void {
    this.productsSubscription = this.productsService
      .getAllProducts()
      .subscribe({
        next: (res: ApiGetAllProductsResponse) => {
          this.allProducts = res.products;
          this.filteredProducts.set([...this.allProducts]);
          console.log('Productos cargados:', this.allProducts);

          // Inicializar el índice de la imagen activa para cada producto
          this.allProducts.forEach((product) => {
            this.activeImageIndexes[product.SKU] = 0;
          });
        },
        error: (error) => console.error('Error al cargar los productos:', error),
        complete: () => console.log('Carga de productos completada.'),
      });
  }

  // Métodos para manejar filtros
  filterProducts() {
    let results = [...this.allProducts];
    const term = this.searchTerm.toLowerCase().trim();

    // Filtrar por término de búsqueda
    if (term) {
      results = results.filter((item) => {
        const title = this.getProductTitle(item).toLowerCase();
        const description = this.getProductDescription(item).toLowerCase();
        const brand = item.marca.toLowerCase();
        const sku = item.SKU.toLowerCase();
        const categories = this.getProductCategories(item).map((cat) => cat.toLowerCase());
        const tags = this.getProductTags(item).map((tag) => tag.toLowerCase());

        return (
          title.includes(term) ||
          description.includes(term) ||
          brand.includes(term) ||
          sku.includes(term) ||
          categories.some((cat) => cat.includes(term)) ||
          tags.some((tag) => tag.includes(term))
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
        this.selectedBrands.includes(item.marca)
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
      this.getProductCategories(item).forEach((cat) => categoriesSet.add(cat));
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
      if (item.marca) brandsSet.add(item.marca);
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

  // Métodos para manejar las imágenes (ADAPTADOS)
  getProductImages(product: ProductoFinal): string[] {
    // Combina la imagen principal con las de la galería, filtrando valores nulos o vacíos.
    return [product.imagen, ...(product.galleryImages || [])].filter(Boolean);
  }

  hasMultipleImages(product: ProductoFinal): boolean {
    return this.getProductImages(product).length > 1;
  }

  getImagesArray(product: ProductoFinal): number[] {
    const imagesLength = this.getProductImages(product).length;
    return Array(imagesLength).fill(0).map((_, i) => i);
  }

  setActiveImage(sku: string, index: number) {
    this.activeImageIndexes[sku] = index;
  }

  getCurrentImageIndex(sku: string): number {
    return this.activeImageIndexes[sku] || 0;
  }

  getActiveImage(product: ProductoFinal): string {
    const images = this.getProductImages(product);
    const index = this.getCurrentImageIndex(product.SKU); // Usar SKU en mayúsculas
    return images[index] || product.imagen || 'assets/placeholder.png'; // Fallback a imagen por defecto
  }

  // Métodos para obtener información del producto (SIMPLIFICADOS)
  getProductTitle(product: ProductoFinal): string {
    return product.nombre || 'Producto sin título';
  }

  getProductDescription(product: ProductoFinal): string {
    return product.descripcion || 'Sin descripción disponible.';
  }

  getProductCategories(product: ProductoFinal): string[] {
    // Combina categoría y subcategoría en un solo array
    const cats = [];
    if (product.categoria) cats.push(product.categoria);
    if (product.subcategoria) cats.push(product.subcategoria);
    return cats;
  }

  getProductTags(product: ProductoFinal): string[] {
    // La nueva interfaz ya provee un array de strings
    return product.etiquetas || [];
  }
}
