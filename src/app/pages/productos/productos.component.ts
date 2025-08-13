import { Component, OnInit, signal } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
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
import { BrandService } from '../../services/brand.service';
import { CertificateSliderComponent } from '../../shared/certificate-slider/certificate-slider.component';
import { GridProductsStoreComponent } from '../../components/products/products-store/grid-products-store.component';
import { SlideProductStoreComponent } from '../../components/products/slide-product-store/slide-product-store.component';
import { AngularToastifyModule, ToastService } from 'angular-toastify';
import { InfoLoginComponent } from './info-login/info-login.component';
import { CreateUserComponent } from '../../components/users/create-user/create-user.component';
import { PRODUCTOS_DEFAULT } from '../../constants/default-products';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AngularToastifyModule,
    FontAwesomeModule,
    FooterComponent,
    RouterLink,
    ProductAdvanceComponent,
    FontAwesomeModule,
    CategoryMenuComponent,
    SliderProductComponent,
    ProductVerticalComponent,
    BrandSliderComponent,
    TeamFormLiteComponent,
    BuscadorPrincipalComponent,
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

  onOutregister() {
    this.createUser = !this.createUser;

    const html = document.documentElement;
    const body = document.body;

    if (this.comprarProductos) {
      html.classList.add('no-scroll');
      body.classList.add('no-scroll');
    } else {
      html.classList.remove('no-scroll');
      body.classList.remove('no-scroll');
    }
  }
  // Mensajes de bienvenida
  welcomeMessages = [
    '¿Estás buscando algún producto en específico?',
    'Puedes explorar nuestras categorías o buscar por marca.',
    '¿En que podemos ayudarte?',
    '¿podrías decirme qué estás buscando?',
    'Estamos aquí para ayudarte',
    'Espero que hoy tengas un excelente día.',
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

  // Arrays de filtros disponibles
  // categorias: string[] = ['Computadoras', 'Accesorios', 'Monitores'];
  // marcas: string[] = ['Dell'];

  productos: ProductoFinal[] = PRODUCTOS_DEFAULT;
  productosFavorites: ProductoFinal[] = PRODUCTOS_DEFAULT;

  @ViewChild('favoritesContainer')
  favoritesContainer!: ElementRef<HTMLDivElement>;
  filteredProducts = signal<ProductoFinal[]>([]);

  constructor(
    private nexsysService: NexsysApiService,
    private ingramService: IngramService,
    private router: Router,
    private cartService: CartService,
    private productService: ProductsService,
    private brandService: BrandService,
    private toastService: ToastService
  ) {
    // En el constructor de NavbarComponent
    cartService.getCart().subscribe((items) => {
      this.cartItemCount = items.length;
    });
  }

  ngOnInit(): void {

    this.loadMarkInFavorites();
    // Cambiamos el mensaje de bienvenida cada 8 segundos
    setInterval(() => {
      this.setRandomWelcomeMessage();
    }, 3000);
  }

  loadMarkInFavorites() {
    this.productosFavorites = this.productosFavorites.map((producto) => {
      const brand = this.brandService.brands.find(
        (b) =>
          b.name.trim().toLowerCase() === producto.marca.trim().toLowerCase()
      );
      return {
        ...producto,
        marca: brand ? brand.url : producto.marca, // si no se encuentra, deja el texto original
      };
    });
  }

  scrollFavorites(direction: 'left' | 'right') {
    const container = this.favoritesContainer?.nativeElement;
    if (!container) return;

    const scrollAmount = 300;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
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

    const html = document.documentElement;
    const body = document.body;

    if (this.menuCategories) {
      html.classList.add('no-scroll');
      body.classList.add('no-scroll');
    } else {
      html.classList.remove('no-scroll');
      body.classList.remove('no-scroll');
    }
  }

  onComprarProductos(): void {
    this.comprarProductos = !this.comprarProductos;
    const html = document.documentElement;
    const body = document.body;

    if (this.comprarProductos) {
      html.classList.add('no-scroll');
      body.classList.add('no-scroll');
    } else {
      html.classList.remove('no-scroll');
      body.classList.remove('no-scroll');
    }
  }

  handleCreate(): void {
    console.log(
      'El usuario quiere registrarse.'
    );
    this.onComprarProductos();
    this.createUser = true;
  }

  handleLogin(): void {
    console.log(
      'El usuario quiere iniciar sesión. Redirigiendo a la página de login...'
    );
    this.onComprarProductos();
    this.router.navigate(['/in']);
  }
}
