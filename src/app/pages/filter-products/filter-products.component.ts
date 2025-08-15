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

// Interfaz para la respuesta paginada del API
interface PagedProductsResponse {
  products: ProductoFinal[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
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
  API_URL = ENVIRONMENT.apiUrlRender; // Cambia esto según tu configuración
  categoria: string = '';
  subcategoria: string = '';
  tituloVista: string = '';
  cargando: boolean = false;
  paginaActual: number = 1;
  totalPaginas: number = 0;
  hayMasProductos: boolean = true;
  private routeSubscription: Subscription | undefined; // Nuevas propiedades para guardar los parámetros de la URL sin capitalizar

  private rawCategoryParam: string | null = null;
  private rawSubcategoryParam: string | null = null;

  constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router) {}


  ngOnInit(): void {
    this.routeSubscription = this.route.paramMap.subscribe((params) => {
      this.resetearEstado();
      this.rawCategoryParam = params.get('categoria');
      this.rawSubcategoryParam = params.get('subcategoria');

      if (this.rawSubcategoryParam) {
        this.subcategoria = this.capitalizar(this.rawSubcategoryParam);
        this.categoria = this.capitalizar(this.rawCategoryParam || '');
        this.tituloVista = `${this.categoria} › ${this.subcategoria}`;
        this.cargarProductos();
      } else if (this.rawCategoryParam) {
        this.categoria = this.capitalizar(this.rawCategoryParam);
        this.subcategoria = '';
        this.tituloVista = this.categoria;
        this.cargarProductos();
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
  }

  @HostListener('window:scroll', ['$event'])
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

   /**
   * Navega a la ruta de la categoría principal.
   * Se usará en el HTML para el enlace.
   */
  irACategoriaPrincipal(): void {
    if (this.rawCategoryParam) {
      this.router.navigate(['/categorias', this.rawCategoryParam]);
    }
  }

  private resetearEstado(): void {
    this.productos = [];
    this.paginaActual = 1;
    this.totalPaginas = 0;
    this.hayMasProductos = true;
    this.cargando = false;
  }

  private cargarProductos(): void {
    this.cargando = true;

    let endpoint: string;
    if (this.rawSubcategoryParam) {
      endpoint = `by-subcategory/${encodeURIComponent(
        this.rawSubcategoryParam
      )}`;
    } else {
      endpoint = `by-category/${encodeURIComponent(
        this.rawCategoryParam || ''
      )}`;
    }

    const params = new HttpParams()
      .set('page', this.paginaActual.toString())
      .set('limit', 10);

    this.http
      .get<PagedProductsResponse>(
        `${this.API_URL}/categories/${endpoint}`,
        { params }
      )
      .subscribe({
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
    if (!this.hayMasProductos) {
      return;
    }
    this.paginaActual++;
    this.cargando = true;

    let endpoint: string;
    if (this.rawSubcategoryParam) {
      endpoint = `by-subcategory/${encodeURIComponent(
        this.rawSubcategoryParam
      )}`;
    } else {
      endpoint = `by-category/${encodeURIComponent(
        this.rawCategoryParam || ''
      )}`;
    }

    const params = new HttpParams()
      .set('page', this.paginaActual.toString())
      .set('limit', 10); // Se ha eliminado el prefijo "/api" para que coincida con la ruta de la primera carga

    this.http
      .get<PagedProductsResponse>(
        `${this.API_URL}/categories/${endpoint}`,
        { params }
      )
      .subscribe({
        next: (res) => {
          this.productos = this.productos.concat(res.products);
          this.hayMasProductos = res.hasNextPage;
          this.cargando = false;
        },
        error: (err) => {
          console.error('Error cargando más productos:', err);
          this.cargando = false;
        },
      });
  }

  private capitalizar(texto: string): string {
    return texto
      .toLowerCase()
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
  }
}
