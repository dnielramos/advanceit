import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
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
  faShareAlt,
} from '@fortawesome/free-solid-svg-icons';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs'; // Removed switchMap, of as not directly used in the provided snippet logic for search
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
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './nexsys.component.html',
  styleUrls: ['./nexsys.component.css'],
})
export class NexsysComponent implements OnInit, OnDestroy {
  faBoxOpen = faBoxOpen;
  faShoppingCart: IconProp = faShoppingCart;
  faHeart: IconProp = faHeart;
  faShareAlt: IconProp = faShareAlt;

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
  allProducts = signal<Product[]>([]); // Store ALL products (or search results) here
  displayedProducts = signal<Product[]>([]); // Only the products for the current page
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  viewMode = signal<'grid' | 'list'>('grid');
  showFilters = signal<boolean>(false);

  // Pagination
  pagination = signal<PaginationInfo>({
    currentPage: 1,
    totalItems: 0,
    itemsPerPage: 12,
    totalPages: 0,
  });

  // Computed properties
  hasProducts = computed(() => this.displayedProducts().length > 0); // Changed to displayedProducts
  canNavigatePrevious = computed(() => this.pagination().currentPage > 1);
  canNavigateNext = computed(
    () => this.pagination().currentPage < this.pagination().totalPages
  );
  paginationPages = computed(() => {
    const total = this.pagination().totalPages;
    const current = this.pagination().currentPage;
    const pages: number[] = [];

    for (
      let i = Math.max(1, current - 2);
      i <= Math.min(total, current + 2);
      i++
    ) {
      pages.push(i);
    }
    return pages;
  });

  // Forms
  searchForm!: FormGroup;
  filterForm!: FormGroup;

  // Subjects for cleanup
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  // Search modes
  searchModes = [
    { value: 'all', label: 'Todos los productos', icon: faBox },
    { value: 'mark', label: 'Por marca', icon: faTags },
    { value: 'sku', label: 'Por SKU', icon: faBarcode },
  ];

  selectedProduct = signal<Product | null>(null);

  constructor(
    private nexsysService: NexsysApiService,
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
      searchTerm: [''],
    });

    this.filterForm = this.fb.group({
      minPrice: [''],
      maxPrice: [''],
      inStock: [false],
    });
  }

  private setupSearch(): void {
    // Debounced search
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((term) => {
        this.performSearch(term);
      });

    // Watch search form changes
    this.searchForm
      .get('searchTerm')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((term) => {
        if (term && term.length > 2) {
          this.searchSubject.next(term);
        } else if (!term) {
          // If search term is cleared, reload all products
          this.loadAllProducts();
        }
      });

    // Watch search mode changes
    this.searchForm
      .get('searchMode')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        const searchTerm = this.searchForm.get('searchTerm')?.value;
        if (searchTerm && searchTerm.length > 2) {
          this.performSearch(searchTerm); // Re-run search with new mode
        } else {
          this.loadAllProducts(); // If no search term, just load all products
        }
      });
  }

  // Product loading methods
  loadAllProducts(page: number = 1): void {
    this.loading.set(true);
    this.error.set(null);

    // Call API with offset and a sufficiently large limit to get ALL products (if your API supports it)
    // Or, if your API has a total count, fetch only the needed page
    // For this example, let's assume we fetch a reasonable chunk (e.g., 100 or 200) and paginate client-side for simplicity,
    // or if the API truly returns ALL products for `getAllProducts`.
    // It's more efficient to fetch only what's needed for the current page from the API if it supports it.
    // If nexsysService.getAllProducts truly paginates, use this:
    const offset = (page - 1) * this.pagination().itemsPerPage;
    this.nexsysService
      .getAllProducts(offset, this.pagination().itemsPerPage) // Use itemsPerPage here
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          console.log('Productos cargados:', data.return);
          const products = data.return || [];
          this.allProducts.set(products); // Store all products
          // If getAllProducts provides total count directly, use it. Otherwise, assume data.return is the total here.
          // You might need an actual `totalItems` from the API response for accurate pagination.
          // For now, let's assume data.return.length is the total if the API gives all in one go for getAllProducts.
          // If your API provides totalItems in the response, use: data.totalItems
          this.updatePagination(data.return.totalItems || products.length, page); // Pass totalItems from API or array length
          this.paginateDisplayedProducts(); // Update displayed products based on current page
          this.loading.set(false);
        },
        error: (error: any) => {
          this.handleError('Error al cargar productos', error);
        },
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
        // If 'all' mode is selected or search term is empty, load all products
        this.loadAllProducts();
        return;
    }

    searchObservable.pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
        // Handle single product or array
        const products = Array.isArray(data.return) ? data.return : data.return ? [data.return] : []; // Ensure products is always an array
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
    if (searchTerm && searchTerm.length > 2) {
      // Only search if term is long enough
      this.performSearch(searchTerm);
    } else {
      this.loadAllProducts(); // If search term cleared or too short, load all products
    }
  }

  // No longer needed if searchModeChange triggers performSearch/loadAllProducts
  // onSearchModeChange(): void {
  //   const searchTerm = this.searchForm.get('searchTerm')?.value;
  //   if (searchTerm) {
  //     this.performSearch(searchTerm);
  //   }
  // }

  toggleFilters(): void {
    this.showFilters.update((show) => !show);
  }

  toggleViewMode(): void {
    this.viewMode.update((mode) => (mode === 'grid' ? 'list' : 'grid'));
  }

  refreshData(): void {
    const currentSearch = this.searchForm.get('searchTerm')?.value;
    if (currentSearch && currentSearch.length > 2) {
      this.performSearch(currentSearch);
    } else {
      this.loadAllProducts(this.pagination().currentPage);
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
    this.filterForm.patchValue({
      minPrice: '',
      maxPrice: '',
      inStock: false,
    });
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
  getProductImage(product: Product): string {
    return product.image || 'assets/images/no-image.png';
  }

  formatPrice(price: number | undefined): string {
    if (!price) return 'Precio no disponible';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
    }).format(price);
  }

  getStockStatus(stock: number | undefined): { text: string; class: string } {
    if (!stock || stock === 0) {
      return { text: 'Sin stock', class: 'text-red-600 bg-red-100' };
    } else if (stock < 10) {
      return { text: 'Stock bajo', class: 'text-yellow-600 bg-yellow-100' };
    } else {
      return { text: 'En stock', class: 'text-green-600 bg-green-100' };
    }
  }
}
