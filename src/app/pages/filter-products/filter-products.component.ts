import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, signal, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronRight, faArrowLeft, faCopyright, faTags, faLayerGroup, faStar, faFilter, faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ProductAdvanceComponent } from '../../components/products/product-advance/product-advance.component';
import { SkeletonFilterProductComponent } from './skeleton-lfilter-product/skeleton-filter-product.component';
import { ProductoFinal } from '../../models/Productos';
import { CategoriesService, GroupedCategory } from '../../services/categories.service';
import { Brand, BrandsService } from '../../services/brands.service';
import { ProductFilterOptions, ProductsService } from '../../services/product.service'; // Asegúrate de tener esta interfaz y servicio
import { BrandMenuComponent } from "../productos/brands/brand-menu.component";
import { CartService } from '../../services/cart.service';
import { AngularToastifyModule, ToastService } from 'angular-toastify';
import { AuthService } from '../../services/auth.service';
import { CreateUserComponent } from "../../components/users/create-user/create-user.component";
import { InfoLoginComponent } from "../productos/info-login/info-login.component";
import { FormsModule } from '@angular/forms'; // ✅ NECESARIO para [(ngModel)]
import { Subject } from 'rxjs';


@Component({
  selector: 'app-product-filter-page',
  imports: [
    CommonModule,
    FontAwesomeModule,
    ProductAdvanceComponent,
    SkeletonFilterProductComponent,
    BrandMenuComponent,
    AngularToastifyModule,
    InfoLoginComponent,
    CreateUserComponent,
    FormsModule, // ✅ AÑADIDO: Importa FormsModule
  ],
  templateUrl: './filter-products.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterProductsComponent implements OnInit, OnDestroy {

  // --- Iconos (Sin cambios) ---
  faChevronRight = faChevronRight;
  faArrowLeft = faArrowLeft;
  faCopyright = faCopyright;
  faTags = faTags;
  faLayerGroup = faLayerGroup;
  faStar = faStar;
  faFilters = faFilter;
  faShoppingCart = faShoppingCart;

  // --- Estado del Componente (Signals) ---
  products = signal<ProductoFinal[]>([]);
  categories = signal<GroupedCategory[]>([]);
  brands = signal<Brand[]>([]);
  activeView = signal<'categories' | 'brands'>('categories');
  currentCategory = signal<GroupedCategory | null>(null);
  isLoading = signal<boolean>(true);
  currentPage = signal<number>(1);
  hasNextPage = signal<boolean>(true);
  viewTitle = signal<string>('Todos los Productos');
  cartItemCount = signal<number>(0);
  isLoggedIn = signal<boolean>(false);
  comprarProductos = signal<boolean>(false);
  createUser = signal<boolean>(false);
  showBrandsMenu = signal<boolean>(false);

  // ✅ NUEVO: Estado para los filtros avanzados
  searchTerm = signal<string>('');
  selectedBrands = signal<Set<string>>(new Set());
  private searchDebouncer = new Subject<string>();

  private routeSubscription?: Subscription;
  private searchSubscription?: Subscription;

  constructor(
    private productService: ProductsService,
    private categoryService: CategoriesService,
    private cartService: CartService,
    private brandService: BrandsService,
    private route: ActivatedRoute,
    private router: Router,
    private toastService: ToastService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadFilterData();

    // Sincroniza el estado del componente con los parámetros de la URL
    this.routeSubscription = this.route.queryParams.subscribe(params => {
      this.currentPage.set(Number(params['page'] || 1));
      this.searchTerm.set(params['search'] || '');

      const brandsFromUrl = params['brands'] ? params['brands'].split(',') : [];
      this.selectedBrands.set(new Set(brandsFromUrl));

      this.resetAndLoadProducts();
      this.updateViewTitle(params);
    });

    // Escucha los cambios en el término de búsqueda con un debounce para no saturar el API
    this.searchSubscription = this.searchDebouncer.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(search => {
      this.applyFilters({ search: search || null, page: 1 }); // Reinicia a la página 1 en cada búsqueda
    });

    this.cartService.getCartCount().subscribe(count => this.cartItemCount.set(count));
    this.authService.isLoggedIn$.subscribe(isLoggedIn => this.isLoggedIn.set(isLoggedIn));
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
    this.searchSubscription?.unsubscribe();
  }

  // --- Carga de Datos ---

  private loadFilterData(): void {
    this.categoryService.categorias$.subscribe(cats => this.categories.set(cats));
    this.brandService.brands$.subscribe(b => this.brands.set(b));
  }

  private resetAndLoadProducts(): void {
    this.products.set([]); // Limpia los productos para mostrar el skeleton
    this.loadProducts();
  }

  private loadProducts(loadMore = false): void {
    if (!this.hasNextPage() && loadMore) return;
    this.isLoading.set(true);

    const params = this.route.snapshot.queryParams;
    const filters: ProductFilterOptions = {
      category: params['category'],
      subcategory: params['subcategory'],
      brands: params['brands'] ? params['brands'].split(',') : [],
      search: params['search'],
      page: this.currentPage(),
      limit: 20,
    };

    // Llama al servicio actualizado para obtener productos filtrados
    this.productService.getFilteredProducts(filters).subscribe(response => {
      if (loadMore) {
        this.products.update(currentProducts => [...currentProducts, ...response.products]);
      } else {
        this.products.set(response.products);
      }
      this.hasNextPage.set(response.hasNextPage);
      this.isLoading.set(false);
    });
  }

  loadMoreProducts(): void {
    this.currentPage.update(page => page + 1);
    this.applyFilters({ page: this.currentPage() });
  }

  // --- Manejo de Filtros ---

  /**
   * Actualiza los parámetros de la URL. La suscripción a queryParams se encarga de recargar los productos.
   */
  private applyFilters(newFilters: { [key: string]: any }): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: newFilters,
      queryParamsHandling: 'merge',
    });
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
    this.searchDebouncer.next(value);
  }

  toggleBrand(brandName: string): void {
    const currentBrands = this.selectedBrands();
    const newBrands = new Set(currentBrands);
    if (newBrands.has(brandName)) {
      newBrands.delete(brandName);
    } else {
      newBrands.add(brandName);
    }
    this.selectedBrands.set(newBrands);
    // Aplica el filtro de marcas y reinicia a la página 1
    this.applyFilters({ brands: Array.from(newBrands).join(',') || null, page: 1 });
  }

  onSelectCategory(categoryName: string): void {
    this.applyFilters({ category: categoryName, subcategory: null, brands: null, search: null, page: 1 });
  }

  onSelectSubcategory(subcategoryName: string): void {
    const parentCategory = this.currentCategory();
    if (parentCategory) {
      this.applyFilters({ category: parentCategory.category, subcategory: subcategoryName, brands: null, search: null, page: 1 });
    }
  }

  // --- Lógica de la Interfaz de Usuario (Sin cambios significativos) ---

  selectCategory(category: GroupedCategory): void {
    if (!category.subCategories || category.subCategories.length === 0) {
      this.onSelectCategory(category.category);
    } else {
      this.currentCategory.set(category);
    }
  }

  private updateViewTitle(params: any): void {
    const { category, subcategory, brands, search } = params;
    if (search) {
      this.viewTitle.set(`Resultados para: "${search}"`);
    } else if (brands) {
      this.viewTitle.set(`Marcas: ${brands.split(',').join(', ')}`);
    } else if (category && subcategory) {
      this.viewTitle.set(`${category} > ${subcategory}`);
    } else if (category) {
      this.viewTitle.set(category);
    } else {
      this.viewTitle.set('Todos los Productos');
    }
  }

  setActiveView(view: 'categories' | 'brands'): void {
    this.activeView.set(view);
    this.currentCategory.set(null);
  }

  goBack(): void {
    this.currentCategory.set(null);
  }

  onComprarProductos(product: ProductoFinal | null): void {
    if (this.isLoggedIn() && product) {
      this.onAddToCart(product);
    } else {
      this.comprarProductos.set(true);
    }
  }

  onAddToCart(product: ProductoFinal): void {
    this.cartService.addToCart(product);
    this.toastService.success(`Producto ${product.nombre} agregado al carrito`);
    this.cartService.getCartCount().subscribe(count => this.cartItemCount.set(count));
  }

  goToCart(): void {
    this.cartService.goToCart();
  }

  onMenuBrands(): void {
    this.showBrandsMenu.set(true);
  }

  closeComprarProductos(): void {
    this.comprarProductos.set(false);
  }

  handleLogin(): void {
    this.comprarProductos.set(false);
    this.createUser.set(false);
  }

  handleCreate(): void {
    this.comprarProductos.set(false);
    this.createUser.set(true);
  }

  onOutregister(): void {
    this.createUser.set(false);
  }
}
