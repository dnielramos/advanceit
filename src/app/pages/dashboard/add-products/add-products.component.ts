import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { HttpClientModule } from '@angular/common/http'; // Importa HttpClientModule
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faSearch,
  faFilter,
  faChevronLeft,
  faChevronRight,
  faSpinner,
  faExclamationTriangle,
  faBox,
  faTags,
  faBarcode,
  faRefresh,
  faEye,
  faList,
  faGripHorizontal as faGrid, // Cambiado a faGripHorizontal para un ícono de cuadrícula más común
  faTimes,
  faBoxOpen,
  faVialVirus,
  faHeart,
  faShareAlt,
} from '@fortawesome/free-solid-svg-icons';
import { Subject, takeUntil, debounceTime, distinctUntilChanged, Observable } from 'rxjs';
import { IngramService } from '../../../services/ingram.service';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { SanitizeImageUrlPipe } from '../../../pipes/sanitize-image-url.pipe'; // Asegúrate de que esta ruta sea correcta
import { ProductoIngram } from '../../../models/ingram'; // Asegúrate de que esta ruta sea correcta
import { ingramPartNumbersDell } from '../../../constants/ingramPartNumbersDell';

interface PaginationInfo {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  totalPages: number;
}

@Component({
  selector: 'app-product-list', // Renombra a product-list
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    HttpClientModule, // Añade HttpClientModule aquí
    SanitizeImageUrlPipe,
  ],
  templateUrl: './add-products.component.html', // Usaremos este mismo archivo para el template
})
export class AddProductsComponent implements OnInit, OnDestroy {
  // Utility function (from your code, keep it)
  convertToInt(value: string): number {
    return parseInt(value, 10);
  }

  // Font Awesome Icons (from your code, ensure all are imported)
  faBoxOpen = faBoxOpen;
  faVialVirus: IconProp = faVialVirus;
  faHeart: IconProp = faHeart;
  faShareAlt: IconProp = faShareAlt;
  faSearch = faSearch;
  faFilter = faFilter;
  faChevronLeft = faChevronLeft;
  faChevronRight = faChevronRight;
  faSpinner = faSpinner;
  faExclamationTriangle = faExclamationTriangle;
  faBox = faBox;
  faTags = faTags;
  faBarcode = faBarcode;
  faRefresh = faRefresh;
  faEye = faEye;
  faList = faList;
  faGrid = faGrid; // Using faGripHorizontal now
  faTimes = faTimes;

  // Reactive signals
  allProducts = signal<ProductoIngram[]>([]);
  displayedProducts = signal<ProductoIngram[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  viewMode = signal<'grid' | 'list'>('grid');
  showFilters = signal<boolean>(false); // This will control the 'hidden' filter section

  // Pagination
  pagination = signal<PaginationInfo>({
    currentPage: 1,
    totalItems: 0,
    itemsPerPage: 12, // Puedes ajustar esto
    totalPages: 0,
  });

  // Computed properties
  hasProducts = computed(() => this.displayedProducts().length > 0);
  canNavigatePrevious = computed(() => this.pagination().currentPage > 1);
  canNavigateNext = computed(
    () => this.pagination().currentPage < this.pagination().totalPages
  );
  paginationPages = computed(() => {
    const total = this.pagination().totalPages;
    const current = this.pagination().currentPage;
    const pages: number[] = [];

    // Logic to show a few pages around the current one
    const startPage = Math.max(1, current - 2);
    const endPage = Math.min(total, current + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  });

  // Forms
  searchForm!: FormGroup;
  // filterForm!: FormGroup; // Removed as per requirement to only show search and SKU, not other filters

  // Subjects for cleanup
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  // Search modes - ONLY 'all' and 'sku'
  searchModes = [
    { value: 'all', label: 'Todos los productos', icon: faBox },
    // { value: 'mark', label: 'Por marca', icon: faTags }, // Removed as per requirement
    { value: 'sku', label: 'Por SKU', icon: faBarcode },
  ];

  selectedProduct = signal<ProductoIngram | null>(null);

  constructor(
    private productService: IngramService, // Usa IngramService
    private fb: FormBuilder
  ) {
    this.initializeForms();
    this.setupSearch();
  }

  ngOnInit(): void {
    this.loadAllProducts(); // Initial load
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForms(): void {
    this.searchForm = this.fb.group({
      searchMode: ['all', Validators.required], // Default to 'all'
      searchTerm: [''],
    });

    // Removed filterForm initialization
  }

  private setupSearch(): void {
    // Debounced search for searchTerm changes
    this.searchForm
      .get('searchTerm')
      ?.valueChanges.pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((term) => {
        const searchMode = this.searchForm.get('searchMode')?.value;
        if (term && term.length >= 3) { // Trigger search only for terms 3 characters or longer
          this.performSearch(term, searchMode);
        } else if (!term && searchMode === 'all') { // If term is cleared and mode is 'all', reload all
          this.loadAllProducts();
        } else if (!term && searchMode === 'sku') { // If term is cleared and mode is 'sku', clear results
          this.allProducts.set([]);
          this.displayedProducts.set([]);
          this.updatePagination(0, 1);
        }
      });

    // Watch search mode changes
    this.searchForm
      .get('searchMode')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((mode) => {
        const searchTerm = this.searchForm.get('searchTerm')?.value;
        if (mode === 'all') {
          this.loadAllProducts(); // If switching to 'all', load all products
        } else if (mode === 'sku' && searchTerm && searchTerm.length >= 3) {
          this.performSearch(searchTerm, mode); // Re-run search if term is present
        } else if (mode === 'sku' && (!searchTerm || searchTerm.length < 3)) {
          this.allProducts.set([]); // Clear products if switching to SKU and no valid term
          this.displayedProducts.set([]);
          this.updatePagination(0, 1);
        }
      });
  }

  // Product loading methods
  loadAllProducts(): void {
    this.loading.set(true);
    this.error.set(null);
    this.productService
      .getProducts(ingramPartNumbersDell)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: ProductoIngram[]) => {
          this.allProducts.set(data); // Store all products
          this.updatePagination(data.length, 1); // Reset to page 1 for all products
          this.paginateDisplayedProducts(); // Update displayed products based on current page
          this.loading.set(false);
          console.log('Productos cargados:', data.length);
        },
        error: (error: any) => {
          this.handleError('Error al cargar productos', error);
        },
      });
  }

  performSearch(term: string, searchMode: 'all' | 'sku'): void {
    this.loading.set(true);
    this.error.set(null);

    let searchObservable: Observable<ProductoIngram | ProductoIngram[] | null>;

    if (searchMode === 'sku') {
      searchObservable = this.productService.getProducts([term]);
    } else { // searchMode === 'all'
      searchObservable = this.productService.getProducts([term]); // This assumes an API endpoint for general search
                                                                  // If not, you'd filter `allProducts` client-side
    }

    searchObservable.pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: ProductoIngram | ProductoIngram[] | null) => {
        const products = Array.isArray(data)
          ? data
          : data ? [data] : []; // Ensure products is always an array
        this.allProducts.set(products); // Store all matching products
        this.updatePagination(products.length, 1); // Reset to page 1 for new search results
        this.paginateDisplayedProducts(); // Update displayed products for the first page of search results
        this.loading.set(false);
      },
      error: (error: any) => {
        this.handleError('Error en la búsqueda', error);
      },
    });
  }

  // New method to paginate the `allProducts` into `displayedProducts`
  private paginateDisplayedProducts(): void {
    const currentPage = this.pagination().currentPage;
    const itemsPerPage = this.pagination().itemsPerPage;
    const all = this.allProducts();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    this.displayedProducts.set(all.slice(startIndex, endIndex));
  }

  // UI Methods
  onSearch(): void {
    const searchTerm = this.searchForm.get('searchTerm')?.value;
    const searchMode = this.searchForm.get('searchMode')?.value;
    if (searchTerm && searchTerm.length >= 3) {
      this.performSearch(searchTerm, searchMode);
    } else if (searchMode === 'all' && !searchTerm) {
        this.loadAllProducts(); // If 'all' mode and search term is empty, load all products
    } else {
        // Handle cases where search term is too short for SKU or 'all' with empty term
        this.allProducts.set([]);
        this.displayedProducts.set([]);
        this.updatePagination(0, 1);
        this.error.set('Por favor, ingresa un término de búsqueda válido (mínimo 3 caracteres para SKU o búsqueda general).');
    }
  }

  toggleFilters(): void {
    this.showFilters.update((show) => !show);
  }

  toggleViewMode(): void {
    this.viewMode.update((mode) => (mode === 'grid' ? 'list' : 'grid'));
  }

  refreshData(): void {
    const currentSearchTerm = this.searchForm.get('searchTerm')?.value;
    const currentSearchMode = this.searchForm.get('searchMode')?.value;

    if (currentSearchTerm && currentSearchTerm.length >= 3) {
      this.performSearch(currentSearchTerm, currentSearchMode);
    } else {
      this.loadAllProducts();
    }
  }

  clearSearch(): void {
    this.searchForm.patchValue({ searchTerm: '' });
    this.loadAllProducts(); // Reload all products when search is cleared
  }

  clearSearchAndFilters(): void {
    this.searchForm.patchValue({
      searchMode: 'all',
      searchTerm: '',
    });
    // Removed filterForm clearing
    this.showFilters.set(false); // Hide filters after clearing
    this.loadAllProducts(); // Reload all products
  }

  // Pagination methods
  goToPage(page: number): void {
    if (page >= 1 && page <= this.pagination().totalPages) {
      this.pagination.update((p) => ({ ...p, currentPage: page }));
      this.paginateDisplayedProducts(); // Re-paginate when page changes
    }
  }

  previousPage(): void {
    if (this.canNavigatePrevious()) {
      this.goToPage(this.pagination().currentPage - 1);
    }
  }

  nextPage(): void {
    if (this.canNavigateNext()) {
      this.goToPage(this.pagination().currentPage + 1);
    }
  }

  // Product methods
  selectProduct(product: ProductoIngram): void {
    this.selectedProduct.set(product);
  }

  closeProductDetail(): void {
    this.selectedProduct.set(null);
  }

  // Utility methods
  private updatePagination(totalItems: number, currentPage: number): void {
    const itemsPerPage = this.pagination().itemsPerPage;
    this.pagination.set({
      currentPage,
      totalItems,
      itemsPerPage,
      totalPages: Math.ceil(totalItems / itemsPerPage),
    });
  }

  private handleError(message: string, error: any): void {
    console.error(message, error);
    this.error.set(`${message}: ${error.message || 'Error desconocido'}`);
    this.loading.set(false);
    this.allProducts.set([]); // Clear products on error
    this.displayedProducts.set([]); // Clear displayed products on error
    this.updatePagination(0, 1); // Reset pagination on error
  }

  // Template helper methods
  getProductImage(product: ProductoIngram): string {
    return product.imagen || 'https://via.placeholder.com/150?text=No+Image'; // Usa product.imagen
  }

  formatPrice(price: number | undefined): string {
    if (price === undefined || price === null) return 'Precio no disponible';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
    }).format(price);
  }

  getStockStatus(stock: number | undefined): { text: string; class: string } { // Cambiado a number para 'cantidad'
    if (stock === undefined || stock === null || stock === 0) {
      return { text: 'Sin stock', class: 'text-red-600 bg-red-100' };
    } else if (stock < 10) {
      return { text: 'Stock bajo', class: 'text-yellow-600 bg-yellow-100' };
    } else {
      return { text: 'En stock', class: 'text-green-600 bg-green-100' };
    }
  }
}
