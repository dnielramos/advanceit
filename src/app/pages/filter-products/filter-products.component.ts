import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, signal, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronRight, faArrowLeft, faCopyright, faTags, faLayerGroup, faStar, faFilter, faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import { ProductAdvanceComponent } from '../../components/products/product-advance/product-advance.component';
import { SkeletonFilterProductComponent } from './skeleton-lfilter-product/skeleton-filter-product.component';
import { ProductoFinal } from '../../models/Productos';
import { CategoriesService, GroupedCategory } from '../../services/categories.service';
import { Brand, BrandsService } from '../../services/brands.service';
import { ProductsService } from '../../services/product.service';
import { BrandMenuComponent } from "../productos/brands/brand-menu.component";
import { CartService } from '../../services/cart.service';
import { AngularToastifyModule, ToastService } from 'angular-toastify';
import { AuthService } from '../../services/auth.service';
import { CreateUserComponent } from "../../components/users/create-user/create-user.component";
import { InfoLoginComponent } from "../productos/info-login/info-login.component";

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
  ],
  templateUrl: './filter-products.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterProductsComponent implements OnInit, OnDestroy {

  // --- Iconos ---
  faChevronRight = faChevronRight;
  faArrowLeft = faArrowLeft;
  faCopyright = faCopyright;
  faTags = faTags;
  faLayerGroup = faLayerGroup;
  faStar = faStar;
  faFilters = faFilter;
  faShoppingCart = faShoppingCart;

  // --- Estado del Componente con Signals ---
  products = signal<ProductoFinal[]>([]);
  categories = signal<GroupedCategory[]>([]);
  brands = signal<Brand[]>([]);

  activeView = signal<'categories' | 'brands'>('categories');
  currentCategory = signal<GroupedCategory | null>(null);

  isLoading = signal<boolean>(true);
  currentPage = signal<number>(1);
  hasNextPage = signal<boolean>(true);
  viewTitle = signal<string>('Todos los Productos');

  private routeSubscription?: Subscription;
  private currentFilters: { [key: string]: string | null } = {};

  cartItemCount = signal<number>(0);
  isLoggedIn = signal<boolean>(false);

  comprarProductos = signal<boolean>(false);
  createUser = signal<boolean>(false);


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
    this.loadFilterData(); // Carga categorías y marcas una vez

    this.routeSubscription = this.route.queryParams.subscribe(params => {
      this.currentFilters = {
        category: params['category'] || null,
        subcategory: params['subcategory'] || null,
        brand: params['brand'] || null,
      };

      this.resetAndLoadProducts();
      this.updateViewTitle();
      this.cartService.getCartCount().subscribe(count => this.cartItemCount.set(count));
      this.authService.isLoggedIn$.subscribe(isLoggedIn => this.isLoggedIn.set(isLoggedIn));
    });
  }

  handleLogin() {
    this.comprarProductos.set(false);
    this.createUser.set(false);
  }

  handleCreate() {
    this.comprarProductos.set(false);
    this.createUser.set(true);
  }


  onComprarProductos(product: ProductoFinal | null): void {
    if (this.isLoggedIn() && product) {
      this.onAddToCart(product);
    } else {
      this.comprarProductos.set(true);
    }
  }

  closeComprarProductos() {
    this.comprarProductos.set(false);

  }

  onOutregister() {
    this.createUser.set(false);
  }


  showBrandsMenu = signal<boolean>(false);

  onMenuBrands() {
    this.showBrandsMenu.set(true);
  }

  goToCart() {
    this.router.navigate(['/productos/cart'])
  }


  onAddToCart(product: ProductoFinal): void {
    this.cartService.addToCart(product);
    this.toastService.success(`Producto ${product.nombre} agregado al carrito`);
    this.cartService.getCartCount().subscribe(count => this.cartItemCount.set(count));
  }

  /**
 * Navega a la vista de productos para una categoría o subcategoría específica.
 * @param categoryName El nombre de la categoría o subcategoría.
 */
  navigateToSubcategory(categoryName: string): void {
    if (categoryName) {
      // Navega a la ruta, por ejemplo: /categorias/Laptops
      this.router.navigate([`/categorias/${this.currentCategory}`, categoryName]);
    }
  }
  /**
   * Navega a la vista de productos para una categoría o subcategoría específica.
   * @param subcategoryName El nombre de la categoría o subcategoría.
   */
  navigateToCategory(subcategoryName: string): void {
    if (subcategoryName) {
      // Navega a la ruta, por ejemplo: /categorias/Laptops
      this.router.navigate([`/categorias`, subcategoryName]);
    }
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
  }

  private loadFilterData(): void {
    this.categoryService.categorias$.subscribe(cats => this.categories.set(cats));
    this.brandService.brands$.subscribe(b => this.brands.set(b));
  }

  private resetAndLoadProducts(): void {
    this.products.set([]);
    this.currentPage.set(1);
    this.hasNextPage.set(true);
    this.loadProducts();
  }

  private loadProducts(loadMore = false): void {
    if (!this.hasNextPage() && loadMore) return;

    this.isLoading.set(true);

    this.productService.getAllProducts().subscribe(response => {
      if (loadMore) {
        this.products.update(currentProducts => [...currentProducts, ...response.products]);
      } else {
        this.products.set(response.products);
      }
      this.hasNextPage.set(response.products.length > 0);
      this.isLoading.set(false);
    });
  }

  loadMoreProducts(): void {
    this.currentPage.update(page => page + 1);
    this.loadProducts(true);
  }

  // --- Lógica del Menú de Filtros ---

  setActiveView(view: 'categories' | 'brands'): void {
    this.activeView.set(view);
    this.currentCategory.set(null);
  }

  selectCategory(category: GroupedCategory): void {
    if (!category.subCategories || category.subCategories.length === 0) {
      this.applyFilters({ category: category.category, subcategory: null, brand: null });
    } else {
      this.currentCategory.set(category);
    }
  }

  goBack(): void {
    this.currentCategory.set(null);
  }

  // --- Navegación y aplicación de filtros ---

  applyFilters(newFilters: { [key: string]: string | null }): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: newFilters,
      queryParamsHandling: 'merge', // Puedes cambiar a 'merge' si quieres combinar filtros
    });
  }

  onSelectCategory(categoryName: string): void {
    this.applyFilters({ category: categoryName, subcategory: null, brand: null });
  }

  onSelectSubcategory(subcategoryName: string): void {
    const parentCategory = this.currentCategory();
    if (parentCategory) {
      this.applyFilters({ category: parentCategory.category, subcategory: subcategoryName, brand: null });
    }
  }

  onSelectBrand(brandName: string): void {
    this.applyFilters({ brand: brandName, category: null, subcategory: null });
  }

  private updateViewTitle(): void {
    const { category, subcategory, brand } = this.currentFilters;
    if (brand) {
      this.viewTitle.set(`Marca: ${brand}`);
    } else if (category && subcategory) {
      this.viewTitle.set(`${category} > ${subcategory}`);
    } else if (category) {
      this.viewTitle.set(category);
    } else {
      this.viewTitle.set('Todos los Productos');
    }
  }
}
