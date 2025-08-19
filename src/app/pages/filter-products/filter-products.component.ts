import {
  Component,
  OnInit,
  Input,
  OnDestroy,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faShoppingCart,
  faCheckCircle,
  faAnglesRight,
} from '@fortawesome/free-solid-svg-icons';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ProductoFinal } from '../../models/Productos';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ProductAdvanceComponent } from '../../components/products/product-advance/product-advance.component';
import { ENVIRONMENT } from '../../../enviroments/enviroment';

interface PagedProductsResponse {
  products: ProductoFinal[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface CategoryResponse {
  category: string;
  subCategories: string[];
  quantity: number;
}

@Component({
  selector: 'app-filter-products',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, ProductAdvanceComponent],
  templateUrl: './filter-products.component.html',
})
export class FilterProductsComponent implements OnInit, OnDestroy {
  @Input() productos: ProductoFinal[] = [];

  faShoppingCart = faShoppingCart;
  faCheckCircle = faCheckCircle;
  faAnglesRight = faAnglesRight;

  private readonly API_URL = ENVIRONMENT.apiUrlRender;

  categoria: string = '';
  subcategoria: string = '';
  tituloVista: string = '';

  categorias: CategoryResponse[] = [];
  seleccionCategoria: string | null = null;
  seleccionSubcategoria: string | null = null;
  modoTodos: boolean = false; // true = usar /advance-products/all-paginated

  cargando: boolean = false;
  paginaActual: number = 1;
  totalPaginas: number = 0;
  hayMasProductos: boolean = true;

  private routeSubscription?: Subscription;

  private rawCategoryParam: string | null = null;
  private rawSubcategoryParam: string | null = null;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarCategorias();

    this.routeSubscription = this.route.paramMap.subscribe((params) => {
      this.resetearEstado();

      this.rawCategoryParam = params.get('categoria');
      this.rawSubcategoryParam = params.get('subcategoria');

      if (!this.rawCategoryParam) {
        // Ruta "todas"
        this.modoTodos = true;
        this.tituloVista = 'Todos los productos';
        this.cargarProductos();
        return;
      }

      this.modoTodos = false;

      if (this.rawSubcategoryParam) {
        this.subcategoria = this.capitalizar(this.rawSubcategoryParam);
        this.categoria = this.capitalizar(this.rawCategoryParam);
        this.tituloVista = `${this.categoria} › ${this.subcategoria}`;
        this.seleccionCategoria = this.categoria;
        this.seleccionSubcategoria = this.subcategoria;
      } else {
        this.categoria = this.capitalizar(this.rawCategoryParam);
        this.subcategoria = '';
        this.tituloVista = this.categoria;
        this.seleccionCategoria = this.categoria;
        this.seleccionSubcategoria = null;
      }

      this.cargarProductos();
    });
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
  }

  @HostListener('window:scroll')
  onScroll(): void {
    const scrollPosition =
      window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;

    if (
      scrollPosition + clientHeight >= scrollHeight - 300 &&
      !this.cargando &&
      this.hayMasProductos
    ) {
      this.cargarMasProductos();
    }
  }

  private resetearEstado(): void {
    this.productos = [];
    this.paginaActual = 1;
    this.totalPaginas = 0;
    this.hayMasProductos = true;
    this.cargando = false;
  }

  private cargarCategorias(): void {
    this.http
      .get<{ catalog: CategoryResponse[] }>(`${this.API_URL}/categories`)
      .subscribe({
        next: (res) => {
          this.categorias = res.catalog;
        },
        error: (err) => {
          console.error('Error cargando categorías:', err);
        },
      });
  }

  private cargarProductos(): void {
    this.cargando = true;

    let url: string;
    if (this.modoTodos) {
      url = `${this.API_URL}/advance-products/all-paginated`;
    } else {
      url = `${this.API_URL}/categories/${this.getEndpoint()}`;
    }

    const params = new HttpParams()
      .set('page', this.paginaActual.toString())
      .set('limit', 10);

    this.http.get<PagedProductsResponse>(url, { params }).subscribe({
      next: (res) => {
        this.productos = res.products;
        this.totalPaginas = res.totalPages;
        this.hayMasProductos = res.hasNextPage;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando productos:', err);
        this.cargando = false;
      },
    });
  }

  private cargarMasProductos(): void {
    if (!this.hayMasProductos) return;

    this.paginaActual++;
    this.cargando = true;

    let url: string;
    if (this.modoTodos) {
      url = `${this.API_URL}/advance-products/all-paginated`;
    } else {
      url = `${this.API_URL}/categories/${this.getEndpoint()}`;
    }

    const params = new HttpParams()
      .set('page', this.paginaActual.toString())
      .set('limit', 10);

    this.http.get<PagedProductsResponse>(url, { params }).subscribe({
      next: (res) => {
        this.productos = [...this.productos, ...res.products];
        this.hayMasProductos = res.hasNextPage;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando más productos:', err);
        this.cargando = false;
      },
    });
  }

  private getEndpoint(): string {
    if (this.rawSubcategoryParam) {
      return `by-subcategory/${encodeURIComponent(this.rawSubcategoryParam)}`;
    }
    return `by-category/${encodeURIComponent(this.rawCategoryParam || '')}`;
  }

  private capitalizar(texto: string): string {
    return texto
      .toLowerCase()
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
  }

  seleccionarFiltro(cat: string | null, sub?: string): void {
    if (!cat) {
      // "Todas"
      this.router.navigate(['/categorias']);
    } else if (sub) {
      this.router.navigate([
        '/categorias',
        cat,
        sub,
      ]);
    } else {
      this.router.navigate([
        '/categorias',
        cat,
      ]);
    }
  }
}
