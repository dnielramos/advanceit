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
import { NexsysProduct, ProductoFinal } from '../../models/Productos'; // Asegúrate de que la ruta sea correcta
import { ProductAdvanceComponent } from '../../components/products/product-advance/product-advance.component';
import { CartService } from '../../services/cart.service';
import { AdvanceProductsService } from '../../services/product.service';
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
import { GridProductsStoreComponent } from '../../components/products/products-store/products-store.component';
import { SlideProductStoreComponent } from '../../components/products/slide-product-store/slide-product-store.component';
import { AngularToastifyModule, ToastService } from 'angular-toastify';
import { InfoLoginComponent } from './info-login/info-login.component';
import { CreateUserComponent } from '../../components/users/create-user/create-user.component';

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
  categorias: string[] = ['Computadoras', 'Accesorios', 'Monitores'];
  marcas: string[] = ['Dell'];

  productos: ProductoFinal[] = [
    {
      id: '1',
      sku: 'LAT5450',
      cantidad: '10',
      estado: 'available',
      nombre: 'Latitude 5450 Portátil',
      descripcion:
        'Intel® Core™ i7-1370P, vPro® de 13.ª generación (14 núcleos, hasta 5,2 GHz de frecuencia Turbo)',
      precio: 1499.99,
      imagen: '/products/notebook-latitude-14-5440-nt-gray-gallery-2.avif',
      marca: 'Dell',
      categoria: 'Computadoras',
      caracteristicas: [
        'Intel® Core™ Ultra 5 135U, vPro®',
        'Windows 11 Pro',
        'Intel® Graphics',
        '16 GB DDR5 | 512 GB SSD | 14.0-in. display Full HD (1920X1080)',
      ],
      etiquetas: ['Nuevo', 'Popular'],
    },
    {
      id: '2',
      sku: 'LAT7450',
      cantidad: '5',
      estado: 'available',
      nombre: 'Latitude 7450 Laptop or 2-in-1',
      descripcion:
        '14-inch premium AI laptop or 2-in-1 featuring 16:10 displays, enhanced audio, ultralight option and Intel® Core™ Ultra processor.',
      precio: 999.99,
      imagen: '/products/notebook-latitude-14-7450-t-gray-gallery-1.avif',
      marca: 'Dell',
      categoria: 'Computadoras',
      caracteristicas: [
        'Intel® Core™ Ultra 7 165U, vPro®',
        'Windows 11 Pro',
        'Intel® Graphics',
        '16 GB LPDDR5X | 256 GB SSD | 14" Non-Touch FHD+ (1920x1200)',
      ],
      etiquetas: ['Nuevo'],
    },
    {
      id: '3',
      sku: 'DWH5024',
      cantidad: '20',
      estado: 'available',
      nombre: 'Dell Pro Wired ANC Headset - WH5024',
      descripcion:
        'Elevate your workday communication with this headset that comes equipped with an AI-based microphone and Active Noise Cancellation, designed to reduce background noise, ensure comfort, and bring your productivity to the next level.',
      precio: 199.99,
      imagen: '/products/accessories-dell-wh5024-anc-bk-gallery-1.avif',
      marca: 'Dell',
      categoria: 'Accesorios',
      caracteristicas: [
        'Microsoft Teams (Open Office) Certified, Zoom Certified',
        '3 Year Limited Hardware with Advanced Exchange Service',
        'Win11/10 64 Bit, Mac OS',
      ],
      etiquetas: ['Recomendado', 'Sonido'],
    },
    {
      id: '4',
      sku: 'P2425H',
      cantidad: '15',
      estado: 'available',
      nombre: 'Dell Pro 24 Plus Monitor - P2425H',
      descripcion: 'In-Plane Switching (IPS) technology | 1920 x 1080',
      precio: 399.99,
      imagen: '/products/monitor-p2425h-black-gallery-2.avif',
      marca: 'Dell',
      categoria: 'Monitores',
      caracteristicas: [
        'In-Plane Switching (IPS) technology',
        'Resolution / Refresh Rate 1920 x 1080',
        'Adjustability Height, Tilt, Swivel, Pivot',
        'Diagonal Size 23.8',
      ],
      etiquetas: ['Nuevo'],
    },
    {
      id: '5',
      sku: 'WD25',
      cantidad: '8',
      estado: 'available',
      nombre: 'Dell Pro Dock - WD25',
      descripcion:
        'Boost your productivity with the latest pro dock that offers up to 100W power delivery and a wide variety of connecting options.',
      precio: 129.99,
      imagen: '/products/dock-station-wd25-black-gallery-1.avif',
      marca: 'Dell',
      categoria: 'Accesorios',
      caracteristicas: [
        '100W (Dell systems) 96W (non-Dell systems)',
        'RJ45 Ethernet port, 2.5GbE',
        '3-Year Limited Hardware Warranty with Advanced Exchange Additional 4- & 5-year warranty optional',
      ],
      etiquetas: ['Popular'],
    },
    {
      id: '6',
      sku: 'KM7321W',
      cantidad: '25',
      estado: 'available',
      nombre: 'Dell Premier Multi-Device Wireless Keyboard and Mouse – KM7321W',
      descripcion:
        'Experience superior multitasking features with a stylish and comfortable premium keyboard and mouse combo. Complete your tasks powered by one of the industry’s leading battery lives at up to 36 months.',
      precio: 59.99,
      imagen: '/products/km7321w-xkb-01-gy.avif',
      marca: 'Dell',
      categoria: 'Accesorios',
      caracteristicas: [
        'USB wireless receiver',
        'Adjustable DPI. 1000, 1600(default), 2400, 4000',
        '12 programmable keys of F1-F12',
      ],
      etiquetas: ['Oferta', 'Popular'],
    },
  ];

  productosFavorites: ProductoFinal[] = [
    {
      id: '1',
      sku: 'LAT5450',
      cantidad: '10',
      estado: 'available',
      nombre: 'Latitude 5450 Portátil',
      descripcion:
        'Intel® Core™ i7-1370P, vPro® de 13.ª generación (14 núcleos, hasta 5,2 GHz de frecuencia Turbo)',
      precio: 1499.99,
      imagen: '/products/notebook-latitude-14-5440-nt-gray-gallery-2.avif',
      marca: 'Dell',
      categoria: 'Computadoras',
      caracteristicas: [
        'Intel® Core™ Ultra 5 135U, vPro®',
        'Windows 11 Pro',
        'Intel® Graphics',
        '16 GB DDR5 | 512 GB SSD | 14.0-in. display Full HD (1920X1080)',
      ],
      etiquetas: ['Nuevo', 'Popular'],
    },
    {
      id: '2',
      sku: 'LAT7450',
      cantidad: '5',
      estado: 'available',
      nombre: 'Latitude 7450 Laptop or 2-in-1',
      descripcion:
        '14-inch premium AI laptop or 2-in-1 featuring 16:10 displays, enhanced audio, ultralight option and Intel® Core™ Ultra processor.',
      precio: 999.99,
      imagen: '/products/notebook-latitude-14-7450-t-gray-gallery-1.avif',
      marca: 'Dell',
      categoria: 'Computadoras',
      caracteristicas: [
        'Intel® Core™ Ultra 7 165U, vPro®',
        'Windows 11 Pro',
        'Intel® Graphics',
        '16 GB LPDDR5X | 256 GB SSD | 14" Non-Touch FHD+ (1920x1200)',
      ],
      etiquetas: ['Nuevo'],
    },
    {
      id: '3',
      sku: 'DWH5024',
      cantidad: '20',
      estado: 'available',
      nombre: 'Dell Pro Wired ANC Headset - WH5024',
      descripcion:
        'Elevate your workday communication with this headset that comes equipped with an AI-based microphone and Active Noise Cancellation, designed to reduce background noise, ensure comfort, and bring your productivity to the next level.',
      precio: 199.99,
      imagen: '/products/accessories-dell-wh5024-anc-bk-gallery-1.avif',
      marca: 'Dell',
      categoria: 'Accesorios',
      caracteristicas: [
        'Microsoft Teams (Open Office) Certified, Zoom Certified',
        '3 Year Limited Hardware with Advanced Exchange Service',
        'Win11/10 64 Bit, Mac OS',
      ],
      etiquetas: ['Recomendado', 'Sonido'],
    },
    {
      id: '4',
      sku: 'P2425H',
      cantidad: '15',
      estado: 'available',
      nombre: 'Dell Pro 24 Plus Monitor - P2425H',
      descripcion: 'In-Plane Switching (IPS) technology | 1920 x 1080',
      precio: 399.99,
      imagen: '/products/monitor-p2425h-black-gallery-2.avif',
      marca: 'Dell',
      categoria: 'Monitores',
      caracteristicas: [
        'In-Plane Switching (IPS) technology',
        'Resolution / Refresh Rate 1920 x 1080',
        'Adjustability Height, Tilt, Swivel, Pivot',
        'Diagonal Size 23.8',
      ],
      etiquetas: ['Nuevo'],
    },
    {
      id: '5',
      sku: 'WD25',
      cantidad: '8',
      estado: 'available',
      nombre: 'Dell Pro Dock - WD25',
      descripcion:
        'Boost your productivity with the latest pro dock that offers up to 100W power delivery and a wide variety of connecting options.',
      precio: 129.99,
      imagen: '/products/dock-station-wd25-black-gallery-1.avif',
      marca: 'Dell',
      categoria: 'Accesorios',
      caracteristicas: [
        '100W (Dell systems) 96W (non-Dell systems)',
        'RJ45 Ethernet port, 2.5GbE',
        '3-Year Limited Hardware Warranty with Advanced Exchange Additional 4- & 5-year warranty optional',
      ],
      etiquetas: ['Popular'],
    },
    {
      id: '6',
      sku: 'KM7321W',
      cantidad: '25',
      estado: 'available',
      nombre: 'Dell Premier Multi-Device Wireless Keyboard and Mouse – KM7321W',
      descripcion:
        'Experience superior multitasking features with a stylish and comfortable premium keyboard and mouse combo. Complete your tasks powered by one of the industry’s leading battery lives at up to 36 months.',
      precio: 59.99,
      imagen: '/products/km7321w-xkb-01-gy.avif',
      marca: 'Dell',
      categoria: 'Accesorios',
      caracteristicas: [
        'USB wireless receiver',
        'Adjustable DPI. 1000, 1600(default), 2400, 4000',
        '12 programmable keys of F1-F12',
      ],
      etiquetas: ['Oferta', 'Popular'],
    },
  ];

  @ViewChild('favoritesContainer')
  favoritesContainer!: ElementRef<HTMLDivElement>;
  filteredProducts = signal<ProductoFinal[]>([]);

  constructor(
    private nexsysService: NexsysApiService,
    private ingramService: IngramService,
    private router: Router,
    private cartService: CartService,
    private productService: AdvanceProductsService,
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

    this.loadProductsByMark();
    // Cambiamos el mensaje de bienvenida cada 8 segundos
    setInterval(() => {
      this.setRandomWelcomeMessage();
    }, 5000);
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

  mapearProducto(nexsysProducto: NexsysProduct): ProductoFinal {
    return {
      id: uuidv4(), // Generamos un UUID para el id
      sku: nexsysProducto.sku,
      cantidad: nexsysProducto.inventory || '0', // Asegúrate de que este campo sea un string
      estado: 'available', // Asignamos un estado por defecto
      nombre: nexsysProducto.name,
      descripcion:
        nexsysProducto.long_description ||
        nexsysProducto.short_description ||
        '',
      precio: nexsysProducto.price,
      imagen: nexsysProducto.image,
      marca: nexsysProducto.mark,
      categoria: nexsysProducto.category,
      etiquetas: [
        nexsysProducto.sku,
        nexsysProducto.mark,
        nexsysProducto.currency,
        nexsysProducto.parent,
      ],
      caracteristicas: [
        nexsysProducto.long_description || '',
        nexsysProducto.short_description || '',
      ],
    };
  }

  loadProductsByMark(): void {
    this.productService.getAllProducts().subscribe({
      next: (data) => {
        console.log('Data cargada:', data);
        // Verificamos si la respuesta es válida
        if (!data) {
          console.error('Respuesta no válida:', data);
          console.warn('No se encontraron productos por marca', typeof data);
          return;
        }
        this.productsFromDB = Array.from(data);
        const $productos = this.productsFromDB.map(
          (producto: ProductoFinal) => producto
        );
        this.productos = [...$productos, ...this.productos];
        this.productos = this.productos.map((producto) => {
          const brand = this.brandService.brands.find((b) =>
            producto.marca
              .trim()
              .toLowerCase()
              .includes(b.name.trim().toLowerCase())
          );
          return {
            ...producto,
            marca: brand ? brand.url : producto.marca, // si no se encuentra, deja el texto original
          };
        });
        this.filteredProducts.set(this.productos);
        console.log('Productos cargados por marca:', this.productos);
        console.log(
          'Productos cargados por marca desde nexsys:',
          this.productsFromDB
        );
      },
      error: (err) => console.error('Error cargando productos por marca:', err),
    });
  }

  loadProductBySKU(): void {
    this.nexsysService.getProductBySKU('GP.BAG11.017').subscribe({
      next: (data) => (this.productBySKU = data),
      error: (err) => console.error('Error cargando producto por SKU:', err),
    });
  }

  loadPaginatedProducts(): void {
    this.nexsysService.getAllProducts(0, 10).subscribe({
      next: (data) => (this.paginatedProducts = data),
      error: (err) => console.error('Error cargando productos paginados:', err),
    });
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

  handleLogin(): void {
    console.log(
      'El usuario quiere iniciar sesión. Redirigiendo a la página de login...'
    );
    this.onComprarProductos();
    this.createUser = true;
    // this.router.navigate(['/in']);
  }
}
