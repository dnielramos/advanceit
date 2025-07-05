import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  faGrin as faGrid,
  faTimes,
  faBoxOpen,
  faShoppingCart,
  faHeart,
  faShareAlt
} from '@fortawesome/free-solid-svg-icons';
import { Subject, takeUntil, debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';
import { NexsysApiService } from '../../../services/nexys.service';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

interface Product {
  id?: string;
  sku: string;
  name: string;
  mark: string;
  price?: number;
  description?: string;
  stock?: number;
  image?: string;
}

interface PaginationInfo {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  totalPages: number;
}

@Component({
  selector: 'app-nexsys',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FontAwesomeModule
  ],
  templateUrl: './nexsys.component.html',
  styleUrls: ['./nexsys.component.css']
})
export class NexsysComponent implements OnInit, OnDestroy {
faBoxOpen = faBoxOpen;
faShoppingCart: IconProp = faShoppingCart;
faHeart: IconProp = faHeart;
faShareAlt: IconProp = faShareAlt;

clearSearchAndFilters() {
throw new Error('Method not implemented.');
}
  // Font Awesome Icons
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
  faGrid = faGrid;
  faTimes = faTimes;

  // Reactive signals
  products = signal<Product[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  viewMode = signal<'grid' | 'list'>('grid');
  showFilters = signal<boolean>(false);

  // Pagination
  pagination = signal<PaginationInfo>({
    currentPage: 1,
    totalItems: 0,
    itemsPerPage: 12,
    totalPages: 0
  });

  // Computed properties
  hasProducts = computed(() => this.products().length > 0);
  canNavigatePrevious = computed(() => this.pagination().currentPage > 1);
  canNavigateNext = computed(() => this.pagination().currentPage < this.pagination().totalPages);
  paginationPages = computed(() => {
    const total = this.pagination().totalPages;
    const current = this.pagination().currentPage;
    const pages: number[] = [];

    for (let i = Math.max(1, current - 2); i <= Math.min(total, current + 2); i++) {
      pages.push(i);
    }
    return pages;
  });

  // Forms
  searchForm !: FormGroup;
  filterForm !: FormGroup;

  // Subjects for cleanup
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  // Search modes
  searchModes = [
    { value: 'all', label: 'Todos los productos', icon: faBox },
    { value: 'mark', label: 'Por marca', icon: faTags },
    { value: 'sku', label: 'Por SKU', icon: faBarcode }
  ];

  selectedProduct = signal<Product | null>(null);

  constructor(
    private nexsysService : NexsysApiService,
    private fb: FormBuilder
  ) {
    this.initializeForms();
    this.setupSearch();
  }

  ngOnInit(): void {
    this.loadAllProducts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForms(): void {
    this.searchForm = this.fb.group({
      searchMode: ['all', Validators.required],
      searchTerm: ['']
    });

    this.filterForm = this.fb.group({
      minPrice: [''],
      maxPrice: [''],
      inStock: [false]
    });
  }

  private setupSearch(): void {
    // Debounced search
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(term => {
      this.performSearch(term);
    });

    // Watch search form changes
    this.searchForm.get('searchTerm')?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(term => {
      if (term && term.length > 2) {
        this.searchSubject.next(term);
      } else if (!term) {
        this.loadAllProducts();
      }
    });
  }

  // Product loading methods
  loadAllProducts(page: number = 1): void {
    this.loading.set(true);
    this.error.set(null);

    const offset = (page - 1) * this.pagination().itemsPerPage;

    this.nexsysService.getAllProducts(offset, this.pagination().itemsPerPage)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          console.log('Productos cargados:', data);
          this.products.set(data.return || []);
          this.updatePagination(data.total || 0, page);
          console.log('productos', this.products());
          this.loading.set(false);
        },
        error: (error: any) => {
          this.handleError('Error al cargar productos', error);
        }
      });
  }

  performSearch(term: string): void {
    const searchMode = this.searchForm.get('searchMode')?.value;
    this.loading.set(true);
    this.error.set(null);

    let searchObservable;

    switch (searchMode) {
      case 'mark':
        searchObservable = this.nexsysService.getProductsByMark(term);
        break;
      case 'sku':
        searchObservable = this.nexsysService.getProductBySKU(term);
        break;
      default:
        this.loadAllProducts();
        return;
    }

    searchObservable.pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data: any) => {
        // Handle single product or array
        const products = Array.isArray(data) ? data : [data];
        this.products.set(products);
        this.updatePagination(products.length, 1);
        this.loading.set(false);
      },
      error: (error: any) => {
        this.handleError('Error en la búsqueda', error);
      }
    });
  }

  // UI Methods
  onSearch(): void {
    const searchTerm = this.searchForm.get('searchTerm')?.value;
    if (searchTerm) {
      this.performSearch(searchTerm);
    } else {
      this.loadAllProducts();
    }
  }

  onSearchModeChange(): void {
    const searchTerm = this.searchForm.get('searchTerm')?.value;
    if (searchTerm) {
      this.performSearch(searchTerm);
    }
  }

  toggleFilters(): void {
    this.showFilters.update(show => !show);
  }

  toggleViewMode(): void {
    this.viewMode.update(mode => mode === 'grid' ? 'list' : 'grid');
  }

  refreshData(): void {
    const currentSearch = this.searchForm.get('searchTerm')?.value;
    if (currentSearch) {
      this.performSearch(currentSearch);
    } else {
      this.loadAllProducts(this.pagination().currentPage);
    }
  }

  clearSearch(): void {
    this.searchForm.patchValue({ searchTerm: '' });
    this.loadAllProducts();
  }

  // Pagination methods
  goToPage(page: number): void {
    if (page >= 1 && page <= this.pagination().totalPages) {
      this.loadAllProducts(page);
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
  selectProduct(product: Product): void {
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
      totalPages: Math.ceil(totalItems / itemsPerPage)
    });
  }

  private handleError(message: string, error: any): void {
    console.error(message, error);
    this.error.set(`${message}: ${error.message || 'Error desconocido'}`);
    this.loading.set(false);
  }

  // Template helper methods
  getProductImage(product: Product): string {
    return product.image || 'assets/images/no-image.png';
  }

  formatPrice(price: number | undefined): string {
    if (!price) return 'Precio no disponible';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(price);
  }

  getStockStatus(stock: number | undefined): { text: string, class: string } {
    if (!stock || stock === 0) {
      return { text: 'Sin stock', class: 'text-red-600 bg-red-100' };
    } else if (stock < 10) {
      return { text: 'Stock bajo', class: 'text-yellow-600 bg-yellow-100' };
    } else {
      return { text: 'En stock', class: 'text-green-600 bg-green-100' };
    }
  }
}
