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
  faBars,
  faSignOut,
  faFilter,
  faDashboard,
} from '@fortawesome/free-solid-svg-icons';
import { Router, RouterLink } from '@angular/router';
import { ProductoFinal } from '../../../models/Productos';
import { TrmComponent } from '../../navbar/trm/trm.component';
import { BrandImageService } from '../../../services/brand-image.service';
import { SanitizeImageUrlPipe } from '../../../pipes/sanitize-image-url.pipe';
import { PRODUCTOS_DEFAULT } from '../../../constants/default-products';
import { ProductsService } from '../../../services/product.service';
import { AuthService, Role } from '../../../services/auth.service';
import { CdkVirtualScrollViewport, ScrollingModule } from '@angular/cdk/scrolling';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

@Component({
  selector: 'app-buscador-navbar',
  standalone: true,
  imports: [
    CommonModule,
    ScrollingModule,
    FormsModule,
    FontAwesomeModule,
    RouterLink,
    SanitizeImageUrlPipe,
    TrmComponent
  ],
  templateUrl: './buscador-navbar.component.html',
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
export class BuscadorNavbarComponent implements OnInit {
  // Mensajes de bienvenida
  welcomeMessages = [
    '¿Algún producto especifico?',
    'Escribe por ejemplo "Dell"',
    'Busca por marca aquí.',
    'Escribe aquí...',
    '¿Qué estás buscando?',
    'Busca por nombre aquí',
  ];
  welcomeMessage = signal('¡Hola Bienvenido!');
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
  faBars = faBars;
  @Output() showCategoriesMenu = new EventEmitter<void>();
  @Output() showBrandsMenu = new EventEmitter<void>();

  islogged: boolean = false;

  // --- CAMBIO 1: Añadir un arreglo para guardar los productos originales ---
  private productosOriginales: ProductoFinal[] = [];

  // Lista de productos que se muestra en la UI y se filtra
  productos: ProductoFinal[] = [];
faSignOut: IconProp = faSignOut;
faFilter: IconProp = faFilter;
faDashboard: IconProp = faDashboard;

  constructor(
    private brandService: BrandImageService,
    private productService: ProductsService,
    private authService: AuthService,
    private router: Router
  ) {}

  inputFocused = false;
  hoveringSuggestions = false;

  onSignOut(): void {
    if (confirm('¿Está seguro de cerrar sesión?')) {
      this.authService.logout();
      this.router.navigate(['/']);
    }
  }

   // Importante: Referencia al CdkVirtualScrollViewport
  @ViewChild(CdkVirtualScrollViewport, { static: false })
  viewport!: CdkVirtualScrollViewport;

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
      this.viewport.scrollToOffset(Math.max(0, currentOffset - scrollAmount), 'smooth');
    }
  }

  onShowOrders(): void {
    console.log('Show Orders clicked');
    this.router.navigate(['/dashboard/orders']);
  }

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

    this.authService.isLoggedIn$.subscribe((isLoggedIn) => {
      this.islogged = isLoggedIn;
    });

    setInterval(() => {
      this.setRandomWelcomeMessage();
    }, 3000);

    this.productService.allProducts$.subscribe((productos) => {
      this.productos = productos;
      this.productosOriginales = productos;
      console.log(
        'Productos cargados en el componente de products:',
        this.productos
      );
    });

    // --- CAMBIO 2: Guardamos la lista procesada en AMBOS arreglos ---
    this.productosOriginales = this.productos; // La lista maestra que no se toca
    this.productos = this.productos; // La lista que se va a mostrar y filtrar
  }

  setRandomWelcomeMessage() {
    const randomIndex = Math.floor(Math.random() * this.welcomeMessages.length);
    this.welcomeMessage.set(this.welcomeMessages[randomIndex]);
  }

  // Métodos para manejar filtros
  filterProducts() {
    // --- CAMBIO 3: Siempre empezamos a filtrar desde la lista ORIGINAL ---
    let filteredList = this.productosOriginales;

    console.log('termino a buscar: ', this.searchTerm);

    // Aplicamos el filtro por término de búsqueda.
    if (this.searchTerm && this.searchTerm.trim() !== '') {
      const term = this.searchTerm.toLowerCase().trim();

      filteredList = filteredList.filter((item) => {
        const brand = item.nombre.toLowerCase();
        const des = item.descripcion.toLowerCase();
        return brand.includes(term) || des.includes(term);
      });
    }

    // Finalmente, actualizamos la lista que se muestra en la vista.
    this.productos = filteredList;
  }

  onMenucategories(): void {
    this.showCategoriesMenu.emit();
  }

  onMenuBrands(): void {
    this.showBrandsMenu.emit();
  }

  // scrollFavorites(direction: 'left' | 'right') {
  //   const container = this.favoritesContainer?.nativeElement;
  //   if (!container) return;

  //   const scrollAmount = 300;
  //   container.scrollBy({
  //     left: direction === 'left' ? -scrollAmount : scrollAmount,
  //     behavior: 'smooth',
  //   });
  // }
}
