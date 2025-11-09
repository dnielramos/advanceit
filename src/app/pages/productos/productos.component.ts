import { Component, OnInit, signal } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  CdkVirtualScrollViewport,
  ScrollingModule,
} from '@angular/cdk/scrolling';
import {
  faShoppingCart,
  faEye,
  faHome,
  faSearch,
  faLayerGroup,
  faTag,
  faComments,
  faCopyright,
  faCodeBranch,
  faShop,
} from '@fortawesome/free-solid-svg-icons';
import {
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import { FooterComponent } from '../../components/footer/footer.component';
import { Router, RouterLink } from '@angular/router';
import { NexsysApiService } from '../../services/nexys.service';
import { IngramService } from '../../services/ingram.service';
import { ProductoFinal } from '../../models/Productos'; // Asegúrate de que la ruta sea correcta
import { ProductAdvanceComponent } from '../../components/products/product-advance/product-advance.component';
import { CartService } from '../../services/cart.service';
import { ProductsService } from '../../services/product.service';
import { CategoryMenuComponent } from './categories/category.component';
import { TrmComponent } from '../../components/navbar/trm/trm.component';
import { SliderProductComponent } from './slider/slider-product.component';
import { ProductVerticalComponent } from '../../components/products/product-vertical/product-vertical.component';
import { BrandSliderComponent } from '../../shared/brand-slider/brand-slider.component';
import { TeamFormLiteComponent } from '../../components/team-form-lite/team-form-lite.component';
import { SimpleCtaComponent } from '../../components/inicio/simple-cta/simple-cta.component';
import { BuscadorPrincipalComponent } from '../../components/products/buscador-principal/buscador-principal.component';
import { SanitizeImageUrlPipe } from '../../pipes/sanitize-image-url.pipe';
import { ViewChild, ElementRef } from '@angular/core';
import { BrandImageService } from '../../services/brand-image.service';
import { CertificateSliderComponent } from '../../shared/certificate-slider/certificate-slider.component';
import { GridProductsStoreComponent } from '../../components/products/products-store/grid-products-store.component';
import { SlideProductStoreComponent } from '../../components/products/slide-product-store/slide-product-store.component';
import { AngularToastifyModule, ToastService } from 'angular-toastify';
import { InfoLoginComponent } from './info-login/info-login.component';
import { CreateUserComponent } from '../../components/users/create-user/create-user.component';
import { PRODUCTOS_DEFAULT } from '../../constants/default-products';
import { AuthService, Role } from '../../services/auth.service';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [
    CommonModule,
    ScrollingModule,
    FormsModule,
    AngularToastifyModule,
    FontAwesomeModule,
    FooterComponent,
    RouterLink,
    ProductAdvanceComponent,
    FontAwesomeModule,
    SliderProductComponent,
    ProductVerticalComponent,
    BrandSliderComponent,
    TeamFormLiteComponent,
    FontAwesomeModule,
    CertificateSliderComponent,
    GridProductsStoreComponent,
    InfoLoginComponent,
    CreateUserComponent,
  ],
  templateUrl: './productos.component.html',
  styles: [
    `
      .line-clamp-4 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    `,
  ],
})
export class ProductosComponent implements OnInit {
  createUser: boolean = false;

  @ViewChild(CdkVirtualScrollViewport, { static: false })
  viewport!: CdkVirtualScrollViewport;

  onOutregister() {
    this.createUser = !this.createUser;
  }
  // Mensajes de bienvenida
  welcomeMessages = [
    '¿Buscando algún producto en específico?',
    'Explora nuestras categorías.',
    'Explora nuestras Marcas.',
    '¿En que podemos ayudarte?',
    '¿podrías decirme qué estás buscando?',
    'Estamos aquí para ayudarte',
    'Espero que tengas un excelente día.',
  ];
  welcomeMessage = signal('¡Hola!  ¿En qué puedo ayudarte hoy?');
  productsFromDB: any[] = [];
  productBySKU: any;
  paginatedProducts: any[] = [];
  cartItemCount = 0;
  // Propiedades para filtro
  searchTerm: string = '';
  filtrosCategorias: string[] = [];
  filtrosMarcas: string[] = [];

  menuCategories = false;
  comprarProductos = false;

  faChat = faComments;
  faShoppingCart = faShoppingCart;
  faEye = faEye;
  faHome = faHome;
  faSearch = faSearch;
  faLayerGroup = faLayerGroup;
  faTag = faTag;
  faCopririgth = faCopyright;
  faCodeBranch = faCodeBranch;
  faShop = faShop;
  faChevronLeft = faChevronLeft;
  faChevronRight = faChevronRight;

  islogged: boolean = false;

  // Arrays de filtros disponibles
  // categorias: string[] = ['Computadoras', 'Accesorios', 'Monitores'];
  // marcas: string[] = ['Dell'];

  productos: ProductoFinal[] = [];
  productosFavorites: ProductoFinal[] = PRODUCTOS_DEFAULT;

  @ViewChild('favoritesContainer')
  favoritesContainer!: ElementRef<HTMLDivElement>;
  filteredProducts = signal<ProductoFinal[]>([]);

  constructor(
    private router: Router,
    private cartService: CartService,
    private productService: ProductsService,
    private authService: AuthService,
    private brandService: BrandImageService,
    private toastService: ToastService
  ) {
    // En el constructor de NavbarComponent
    cartService.getCart().subscribe((items) => {
      this.cartItemCount = items.length;
    });
  }

  ngOnInit(): void {
    this.authService.isLoggedIn$.subscribe((isLoggedIn) => {
      this.islogged = isLoggedIn;
    });
    this.productService.allProducts$.subscribe((productos) => {
      this.productos = productos;
      this.productosFavorites = productos;
      console.log(
        'Productos cargados en el componente de products:',
        this.productos
      );
    });
  }

  // Un método para trackear por índice
  trackByIndex(index: number, item: any): number {
    return index;
  }

  scrollFavorites(direction: 'left' | 'right') {
    // Definimos el ancho de un solo producto, debe coincidir con itemSize en el HTML
    const itemWidth = 250;
    const currentOffset = this.viewport.measureScrollOffset();
    const viewportWidth = this.viewport.getViewportSize(); // Devuelve el número de ítems visibles

    let scrollAmount = itemWidth; // Cantidad a desplazar por cada click

    if (direction === 'right') {
      this.viewport.scrollToOffset(currentOffset + scrollAmount, 'smooth');
    } else {
      this.viewport.scrollToOffset(
        Math.max(0, currentOffset - scrollAmount),
        'smooth'
      );
    }
  }

  setRandomWelcomeMessage() {
    const randomIndex = Math.floor(Math.random() * this.welcomeMessages.length);
    this.welcomeMessage.set(this.welcomeMessages[randomIndex]);
  }

  // Métodos para manejar filtros
  filterProducts() {
    let results = [...this.productos];

    // Filtrar por término de búsqueda
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      results = results.filter((item) => {
        const brand = item.nombre.toLowerCase();
        const des = item.descripcion.toLowerCase();

        return brand.includes(term) || des.includes(term);
      });
    }
  }

  addToCart(product: ProductoFinal): void {
    if (this.cartService.addToCart(product)) {
      this.toastService.success(`${product.nombre} añadido al carrito`);
    } else {
      this.toastService.error(`NO pude añadir ${product.nombre} al carrito`);
    }
    // alert(`${product.nombre} añadido al carrito`);
  }

  // Filtrado dinámico
  get productosFiltrados(): ProductoFinal[] {
    return this.productos.filter((producto) => {
      const matchesSearch = this.searchTerm
        ? producto.nombre
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase()) ||
          producto.marca
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase()) ||
          producto.categoria
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase())
        : true;
      const matchesCategoria =
        this.filtrosCategorias.length > 0
          ? this.filtrosCategorias.includes(producto.categoria)
          : true;
      const matchesMarca =
        this.filtrosMarcas.length > 0
          ? this.filtrosMarcas.includes(producto.marca)
          : true;
      return matchesSearch && matchesCategoria && matchesMarca;
    });
  }

  // Manejo de filtros para categorías
  onFiltroCategoria(categoria: string, event: any) {
    if (event.target.checked) {
      this.filtrosCategorias.push(categoria);
    } else {
      this.filtrosCategorias = this.filtrosCategorias.filter(
        (c) => c !== categoria
      );
    }
  }

  // Manejo de filtros para marcas
  onFiltroMarca(marca: string, event: any) {
    if (event.target.checked) {
      this.filtrosMarcas.push(marca);
    } else {
      this.filtrosMarcas = this.filtrosMarcas.filter((m) => m !== marca);
    }
  }

  onMenucategories(): void {
    this.menuCategories = !this.menuCategories;
  }

  onComprarProductos(product: ProductoFinal | null): void {
    if (this.authService.hasRole(Role.User) && product) {
      this.addToCart(product);
    } else {
      this.comprarProductos = !this.comprarProductos;
    }
  }

  handleCreate(): void {
    this.router.navigate(['/contacto']);

    // this.onComprarProductos(null);
    // this.createUser = true;
  }

  handleLogin(): void {
    this.onComprarProductos(null);
    this.router.navigate(['/in']);
  }
}
