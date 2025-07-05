import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  signal,
  ViewChild,
} from '@angular/core';
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
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import { RouterLink } from '@angular/router';
import { Producto } from '../../../models/Productos';
import { TrmComponent } from '../../navbar/trm/trm.component';
import { AdvanceProductsComponent } from '../../../pages/dashboard/advance-products/advance-products.component';
import { ProductAdvanceComponent } from '../product-advance/product-advance.component';
import { BrandService } from '../../../services/brand.service';
import { SanitizeImageUrlPipe } from '../../../pipes/sanitize-image-url.pipe';

@Component({
  selector: 'app-buscador-principal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FontAwesomeModule,
    RouterLink,
    FontAwesomeModule,
    TrmComponent,
    AdvanceProductsComponent,
    ProductAdvanceComponent,
    SanitizeImageUrlPipe,
  ],
  templateUrl: './buscador-principal.component.html',
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
export class BuscadorPrincipalComponent implements OnInit {
  // Mensajes de bienvenida
  welcomeMessages = [
    '¿Algún producto en específico?',
    'Buscar por marca.',
    '¿En que podemos ayudarte?',
    '¿Qué estás buscando?',
    'Estamos para ayudarte',
    'Busca por nombre'
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
  @Output() showCategoriesMenu = new EventEmitter<void>();

  // Lista de productos (ejemplo ampliado con propiedades adicionales)
  productos: Producto[] = [
    {
      id: '1',
      nombre: 'Latitude 5450 Portátil',
      descripcion:
        'Intel® Core™ i7-1370P, vPro® de 13.ª generación (14 núcleos, hasta 5,2 GHz de frecuencia Turbo) ',
      precio: 1499.99,
      imagen: '/products/notebook-latitude-14-5440-nt-gray-gallery-2.avif',
      marca: 'Dell',
      caracteristicas: [
        'Intel® Core™ Ultra 5 135U, vPro®',
        'Windows 11 Pro',
        'Intel® Graphics',
        '16 GB DDR5 | 512 GB SSD | 14.0-in. display Full HD (1920X1080)',
      ],
      categoria: 'Computadoras',
      etiquetas: ['Nuevo', 'Popular'],
    },
    {
      id: '2',
      nombre: 'Latitude 7450 Laptop or 2-in-1',
      descripcion:
        '14-inch premium AI laptop or 2-in-1 featuring 16:10 displays, enhanced audio, ultralight option and Intel® Core™ Ultra processor.',
      precio: 999.99,
      imagen: '/products/notebook-latitude-14-7450-t-gray-gallery-1.avif',
      marca: 'Dell',
      caracteristicas: [
        'Intel® Core™ Ultra 7 165U, vPro®',
        'Windows 11 Pro',
        'Intel® Graphics',
        '16 GB LPDDR5X | 256 GB SSD | 14" Non-Touch FHD+ (1920x1200)',
      ],
      categoria: 'Computadoras',
      etiquetas: ['Nuevo'],
    },
    {
      id: '3',
      nombre: 'Dell Pro Wired ANC Headset - WH5024',
      descripcion:
        'Elevate your workday communication with this headset that comes equipped with an AI-based microphone and Active Noise Cancellation, designed to reduce background noise, ensure comfort, and bring your productivity to the next level.',
      precio: 199.99,
      imagen: '/products/accessories-dell-wh5024-anc-bk-gallery-1.avif',
      marca: 'Dell',
      caracteristicas: [
        'Microsoft Teams (Open Office) Certified, Zoom Certified',
        '3 Year Limited Hardware with Advanced Exchange Service',
        'Win11/10 64 Bit, Mac OS',
      ],
      categoria: 'Accesorios',
      etiquetas: ['Recomendado', 'Sonido'],
    },
    {
      id: '4',
      nombre: 'Dell Pro 24 Plus Monitor - P2425H',
      descripcion: 'In-Plane Switching (IPS) technology | 1920 x 1080',
      precio: 399.99,
      imagen: '/products/monitor-p2425h-black-gallery-2.avif',
      marca: 'Dell',
      caracteristicas: [
        'In-Plane Switching (IPS) technology',
        'Resolution / Refresh Rate 1920 x 1080',
        'Adjustability Height, Tilt, Swivel, Pivot',
        'Diagonal Size 23.8',
      ],
      categoria: 'Monitores',
      etiquetas: ['Nuevo'],
    },
    {
      id: '5',
      nombre: 'Dell Pro Dock - WD25',
      descripcion:
        'Boost your productivity with the latest pro dock that offers up to 100W power delivery and a wide variety of connecting options.',
      precio: 129.99,
      imagen: '/products/dock-station-wd25-black-gallery-1.avif',
      marca: 'Dell',
      caracteristicas: [
        '100W (Dell systems) 96W (non-Dell systems)',
        'RJ45 Ethernet port, 2.5GbE',
        '3-Year Limited Hardware Warranty with Advanced Exchange Additional 4- & 5-year warranty optional',
      ],
      categoria: 'Accesorios',
      etiquetas: ['Popular'],
    },
    {
      id: '6',
      nombre: 'Dell Premier Multi-Device Wireless Keyboard and Mouse – KM7321W',
      descripcion:
        'Experience superior multitasking features with a stylish and comfortable premium keyboard and mouse combo. Complete your tasks powered by one of the industry’s leading battery lives at up to 36 months.',
      precio: 59.99,
      imagen: '/products/km7321w-xkb-01-gy.avif',
      marca: 'Dell',
      caracteristicas: [
        'USB wireless receiver',
        'Adjustable DPI. 1000, 1600(default), 2400, 4000',
        '12 programmable keys of F1-F12',
      ],
      categoria: 'Accesorios',
      etiquetas: ['Oferta', 'Popular'],
    },
  ];

  constructor(private brandService: BrandService) {}

  inputFocused = false;
  hoveringSuggestions = false;

  onInputFocus(): void {
    this.inputFocused = true;
  }

  onInputBlur(): void {
    setTimeout(() => {
      if (!this.hoveringSuggestions) {
        this.inputFocused = false;
      }
    }, 200);
  }

  onMouseEnterSuggestions(): void {
    this.hoveringSuggestions = true;
  }

  onMouseLeaveSuggestions(): void {
    this.hoveringSuggestions = false;
    // Si el input ya no está enfocado, ocultar
    setTimeout(() => {
      if (
        !document.activeElement ||
        !(document.activeElement as HTMLElement).closest('input')
      ) {
        this.inputFocused = false;
      }
    }, 100);
  }

  @ViewChild('favoritesContainer')
  favoritesContainer!: ElementRef<HTMLDivElement>;

  ngOnInit(): void {
    // this.loadProductsByMark();
    // Cambiamos el mensaje de bienvenida cada 8 segundos
    setInterval(() => {
      this.setRandomWelcomeMessage();
    }, 5000);

    this.productos = this.productos.map((producto) => {
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

  onMenucategories(): void {
    this.showCategoriesMenu.emit();
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
}
