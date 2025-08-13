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
import { ProductoFinal } from '../../../models/Productos';
import { TrmComponent } from '../../navbar/trm/trm.component';
import { BrandService } from '../../../services/brand.service';
import { SanitizeImageUrlPipe } from '../../../pipes/sanitize-image-url.pipe';
import { PRODUCTOS_DEFAULT } from '../../../constants/default-products';

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
    'Busca por nombre',
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

  // --- CAMBIO 1: Añadir un arreglo para guardar los productos originales ---
  private productosOriginales: ProductoFinal[] = [];

  // Lista de productos que se muestra en la UI y se filtra
  productos: ProductoFinal[] = [];

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
    setInterval(() => {
      this.setRandomWelcomeMessage();
    }, 3000);

    // Procesamos los productos iniciales
    const processedProducts = PRODUCTOS_DEFAULT.map((producto) => {
      const brand = this.brandService.brands.find(
        (b) =>
          b.name.trim().toLowerCase() === producto.marca.trim().toLowerCase()
      );
      return {
        ...producto,
        marca: brand ? brand.url : producto.marca,
      };
    });

    // --- CAMBIO 2: Guardamos la lista procesada en AMBOS arreglos ---
    this.productosOriginales = processedProducts; // La lista maestra que no se toca
    this.productos = processedProducts; // La lista que se va a mostrar y filtrar
  }

  setRandomWelcomeMessage() {
    const randomIndex = Math.floor(Math.random() * this.welcomeMessages.length);
    this.welcomeMessage.set(this.welcomeMessages[randomIndex]);
  }

  // Métodos para manejar filtros
  filterProducts() {
    // --- CAMBIO 3: Siempre empezamos a filtrar desde la lista ORIGINAL ---
    let filteredList = this.productosOriginales;

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
