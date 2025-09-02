import { Component, OnDestroy, OnInit, signal, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faSearch,
  faPlus,
  faTag,
  faStore,
  faHeart,
  faFilter,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { trigger, transition, style, animate } from '@angular/animations';
import { Subscription } from 'rxjs';
import { ApiGetAllProductsResponse, ProductsService } from '../../../services/product.service';
import { ProductoFinal } from '../../../models/Productos';

@Component({
  selector: 'app-quotation-products',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  template: `
    <div
      *ngIf="isVisible"
      class="fixed inset-0 z-[1000] flex items-center justify-center bg-gray-900/50 backdrop-blur-sm"
    >
      <div
        class="relative flex h-screen w-full flex-col rounded-lg bg-white p-4 shadow-2xl md:p-6 lg:rounded-none"
      >
        <div
          class="sticky top-0 z-30 flex items-center justify-between border-b border-gray-200 bg-white/80 pb-4 backdrop-blur-sm mb-6"
        >
          <h5 class="text-xl font-bold text-gray-800 md:text-2xl">Seleccionar Productos</h5>
          <button type="button" class="text-gray-500 hover:text-gray-700" (click)="close()">
            <fa-icon [icon]="faTimes" class="text-2xl"></fa-icon>
          </button>
        </div>

        <div class="sticky top-[50px] z-20 w-full bg-white/80 py-4 backdrop-blur-sm">
          <div class="relative">
            <input
              type="text"
              [(ngModel)]="searchTerm"
              (input)="filterProducts()"
              placeholder="Busca por nombre, marca, SKU..."
              class="w-full rounded-full border border-purple-300 px-6 py-3 pl-12 text-base shadow-sm outline-none transition-shadow duration-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 md:py-4 md:text-lg"
            />
            <fa-icon
              [icon]="faSearch"
              class="absolute left-5 top-1/2 -translate-y-1/2 text-lg text-gray-400 md:text-xl"
            ></fa-icon>
          </div>
        </div>

        <div class="modal-body h-full overflow-y-auto pt-36">
          <div
            *ngIf="filteredProducts().length > 0; else noProducts"
            class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3"
          >
            <div
              *ngFor="let item of filteredProducts(); trackby: trackBySku"
              @fadeIn
              class="flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-md transition-shadow duration-300 hover:shadow-xl"
            >
              <div class="group relative h-36 overflow-hidden bg-gray-100 md:h-48">
                <img
                  [src]="getActiveImage(item)"
                  [alt]="getProductTitle(item)"
                  class="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              <div class="flex flex-grow flex-col p-4 md:p-5">
                <div class="mb-2">
                  <span
                    class="text-xs font-medium text-purple-800"
                  >
                    {{ item.marca }}
                  </span>
                  <h3
                    class="line-clamp-2 cursor-pointer text-base font-semibold text-gray-800 hover:text-purple-700 md:text-lg"
                    title="{{ getProductTitle(item) }}"
                  >
                    {{ getProductTitle(item) }}
                  </h3>
                </div>

                <div class="mt-auto">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-lg font-bold text-gray-900 md:text-xl">
                        {{
                          item.precio
                            ? (item.precio | currency : "USD" : "symbol" : "1.0-0")
                            : "Consultar"
                        }}
                      </p>
                    </div>
                  </div>

                  <div class="mt-4">
                    <button
                      [disabled]="!item.disponibilidad"
                      (click)="selectProduct(item)"
                      class="flex w-full items-center justify-center rounded-lg px-3 py-2 text-sm font-bold text-white transition-colors disabled:cursor-not-allowed disabled:bg-gray-300 md:px-4 md:py-2 md:text-base"
                      [ngClass]="
                        item.disponibilidad
                          ? 'bg-purple-600 hover:bg-purple-700'
                          : 'bg-gray-400'
                      "
                    >
                      <fa-icon
                        [icon]="faPlus"
                        class="mr-2"
                      ></fa-icon>
                      <span>Añadir a la cotización</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <ng-template #noProducts>
            <div class="flex flex-col items-center py-10 text-center md:py-20">
              <fa-icon
                [icon]="faSearch"
                class="mb-4 text-5xl text-gray-300 md:text-6xl"
              ></fa-icon>
              <h3 class="text-lg font-semibold text-gray-700 md:text-xl">
                No se encontraron productos
              </h3>
              <p class="text-gray-500 text-sm md:text-base">
                Intenta ajustar tu búsqueda o limpiar los filtros.
              </p>
            </div>
          </ng-template>
        </div>
      </div>
    </div>
  `,
  styles: [],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms', style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class QuotationProductsComponent implements OnInit, OnDestroy {
  @Input() isVisible = false;
  @Output() productSelected = new EventEmitter<ProductoFinal>();
  @Output() closeModal = new EventEmitter<void>();

  faSearch = faSearch;
  faPlus = faPlus;
  faTag = faTag;
  faStore = faStore;
  faHeart = faHeart;
  faFilter = faFilter;
  faTimes = faTimes;

  allProducts: ProductoFinal[] = [];
  filteredProducts = signal<ProductoFinal[]>([]);

  private productsSubscription?: Subscription;

  constructor(private productsService: ProductsService) {}

  searchTerm: string = '';
  selectedCategories: string[] = [];
  selectedBrands: string[] = [];
  showCategoryFilter = signal(false);
  showBrandFilter = signal(false);
  activeImageIndexes: Record<string, number> = {};

  welcomeMessages = [
    '¡Descubre lo último en tecnología!',
    '¡Ofertas especiales solo por hoy!',
    'Envío gratis en compras superiores a $100',
    '¡Encuentra el producto perfecto para ti!',
    '¡Bienvenido a la mejor tienda de tecnología!',
  ];
  welcomeMessage = signal('');

  ngOnInit() {
    this.loadProducts();
    this.setRandomWelcomeMessage();
    setInterval(() => this.setRandomWelcomeMessage(), 5000);
  }

  ngOnDestroy(): void {
    this.productsSubscription?.unsubscribe();
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

          this.allProducts.forEach((product) => {
            this.activeImageIndexes[product.SKU] = 0;
          });
        },
        error: (error) => console.error('Error al cargar los productos:', error),
        complete: () => console.log('Carga de productos completada.'),
      });
  }

  filterProducts() {
    let results = [...this.allProducts];
    const term = this.searchTerm.toLowerCase().trim();

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
    if (this.selectedCategories.length > 0) {
      results = results.filter((item) => {
        const categories = this.getProductCategories(item);
        return this.selectedCategories.some((cat) => categories.includes(cat));
      });
    }

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

  getProductImages(product: ProductoFinal): string[] {
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
    const index = this.getCurrentImageIndex(product.SKU);
    return images[index] || product.imagen || 'assets/placeholder.png';
  }

  getProductTitle(product: ProductoFinal): string {
    return product.nombre || 'Producto sin título';
  }

  getProductDescription(product: ProductoFinal): string {
    return product.descripcion || 'Sin descripción disponible.';
  }

  getProductCategories(product: ProductoFinal): string[] {
    const cats = [];
    if (product.categoria) cats.push(product.categoria);
    if (product.subcategoria) cats.push(product.subcategoria);
    return cats;
  }

  getProductTags(product: ProductoFinal): string[] {
    return product.etiquetas || [];
  }

  selectProduct(product: ProductoFinal): void {
    this.productSelected.emit(product);
  }

  close(): void {
    this.closeModal.emit();
  }
}
