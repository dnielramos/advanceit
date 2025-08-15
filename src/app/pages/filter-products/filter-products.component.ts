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
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

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
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './filter-products.component.html',
})
export class FilterProductsComponent implements OnInit, OnDestroy {
  @Input() productos: ProductoFinal[] = [];

  faShoppingCart = faShoppingCart;
  faCheckCircle = faCheckCircle;
  faAnglesRight = faAnglesRight;

  categoria: string = '';
  subcategoria: string = '';
  tituloVista: string = '';
  cargando: boolean = false;
  paginaActual: number = 1;
  totalPaginas: number = 0;
  hayMasProductos: boolean = true;
  private routeSubscription: Subscription | undefined;

  constructor(private http: HttpClient, private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Escuchamos los cambios en los parámetros de la URL
    this.routeSubscription = this.route.paramMap.subscribe((params) => {
      this.resetearEstado(); // Reinicia el estado cada vez que cambian los parámetros
      const categoryParam = params.get('categoria');
      const subcategoryParam = params.get('subcategoria');

      if (subcategoryParam) {
        this.subcategoria = this.capitalizar(subcategoryParam);
        this.categoria = this.capitalizar(categoryParam || '');
        this.tituloVista = `${this.categoria} › ${this.subcategoria}`;
        this.cargarProductos(
          `by-subcategory/${encodeURIComponent(subcategoryParam)}`,
        );
      } else if (categoryParam) {
        this.categoria = this.capitalizar(categoryParam);
        this.subcategoria = '';
        this.tituloVista = this.categoria;
        this.cargarProductos(
          `by-category/${encodeURIComponent(categoryParam)}`,
        );
      }
    });
  }

  ngOnDestroy(): void {
    // Desuscribirse para evitar fugas de memoria
    this.routeSubscription?.unsubscribe();
  }

  /**
   * Escucha el evento de scroll para cargar más productos
   */
  @HostListener('window:scroll', ['$event'])
  onScroll(): void {
    // Calcula si el usuario ha llegado al final de la página
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
   * Reinicia el estado del componente.
   */
  private resetearEstado(): void {
    this.productos = [];
    this.paginaActual = 1;
    this.totalPaginas = 0;
    this.hayMasProductos = true;
    this.cargando = false;
  }

  /**
   * Carga la primera página de productos.
   * @param endpoint El endpoint del API a consultar
   */
  private cargarProductos(endpoint: string): void {
    this.cargando = true;
    const params = new HttpParams()
      .set('page', this.paginaActual.toString())
      .set('limit', 10); // Establece el límite de productos por página
    this.http
      .get<PagedProductsResponse>(`http://localhost:3002/categories/${endpoint}`, { params })
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

  /**
   * Carga la siguiente página de productos.
   */
  private cargarMasProductos(): void {
    if (!this.hayMasProductos) {
      return;
    }
    this.paginaActual++;
    this.cargando = true;

    // Determina el endpoint basado en el estado actual
    let endpoint: string;
    let param: string;
    if (this.subcategoria) {
      endpoint = `by-subcategory/${this.subcategoria}`;
      param = this.subcategoria;
    } else {
      endpoint = `by-category/${this.categoria}`;
      param = this.categoria;
    }

    const params = new HttpParams()
      .set('page', this.paginaActual.toString())
      .set('limit', 10);

    this.http
      .get<PagedProductsResponse>(`http://localhost:3002/api/categories/${endpoint}`, { params })
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
