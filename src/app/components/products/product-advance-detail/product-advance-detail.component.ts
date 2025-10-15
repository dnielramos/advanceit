import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTimes, faCheckCircle, faPlus, faMinus, faInfoCircle, faMicrochip, faTag, faArrowLeft, faSpinner, faExclamationTriangle, faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import { Observable, of } from 'rxjs';
import { switchMap, catchError, tap } from 'rxjs/operators';
import { ProductoFinal } from '../../../models/Productos';
import { ProductsService } from '../../../services/product.service';
import { SanitizeImageUrlPipe } from "../../../pipes/sanitize-image-url.pipe";
import { ToastService, AngularToastifyModule } from 'angular-toastify';
import { CartService } from '../../../services/cart.service';
import { CartComponent } from '../../cart/cart.component';
import { AuthService } from '../../../services/auth.service';

// Asume que tienes un servicio e interfaces definidos así:



interface TechnicalSpecifications {
  [key: string]: any;
}

@Component({
  selector: 'app-product-advance-detail',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, CurrencyPipe, SanitizeImageUrlPipe, AngularToastifyModule],
  templateUrl: './product-advance-detail.component.html',
})
export class ProductAdvanceDetailComponent implements OnInit {

  // --- Estado del Componente ---
  public product$!: Observable<ProductoFinal | null | undefined>; // Puede ser nulo (no encontrado) o indefinido (cargando/error)
  public isLoading = true;
  public errorOccurred = false;

  public quantity = 1;
  public activeTab: 'description' | 'specs' = 'description';

  // Propiedades para almacenar los datos parseados
  public parsedFeatures: string[] = [];
  public parsedSpecs: any = null;
  public specCategories: string[] = [];

  // --- Iconos de Font Awesome ---
  faArrowLeft = faArrowLeft;
  faSpinner = faSpinner;
  faExclamationTriangle = faExclamationTriangle;
  faCheckCircle = faCheckCircle;
  faPlus = faPlus;
  faMinus = faMinus;
  faInfoCircle = faInfoCircle;
  faMicrochip = faMicrochip;
  faTag = faTag;

  faShoppingCart = faShoppingCart;

    cartItemCount = signal<number>(0);
    isLoggedIn = signal<boolean>(false);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productsService: ProductsService,
    private location: Location,
    private toastService: ToastService,
    public cartService: CartService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.product$ = this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        if (!id) {
          this.isLoading = false;
          this.errorOccurred = true;
          return of(null); // No hay ID, retorna nulo.
        }

        // Inicia la carga
        this.isLoading = true;
        this.errorOccurred = false;

        return this.productsService.getProductById(id).pipe(
          tap(product => {
            // Cuando los datos llegan, procesamos y actualizamos el estado
            this.isLoading = false;
            if (product) {
              this.parseProductData(product);
            } else {
              // El producto no fue encontrado por el servicio
              this.errorOccurred = true;
            }
          }),
          catchError(() => {
            // Si ocurre un error en la petición HTTP
            this.isLoading = false;
            this.errorOccurred = true;
            return of(null); // Retorna nulo en caso de error
          })
        );
      })
    );


    this.cartService.getCartCount().subscribe(count => this.cartItemCount.set(count));
    this.authService.isLoggedIn$.subscribe(isLoggedIn => this.isLoggedIn.set(isLoggedIn));
  }

  /**
   * Parsea los campos JSON del producto. Ahora es un método que recibe el producto.
   */
  private parseProductData(product: ProductoFinal): void {
    try {
      this.parsedFeatures = JSON.parse(product["caracteristicas"]);
      this.parsedSpecs = JSON.parse(product["especificaciones_tecnicas"]?.toString() || '{}'); // Asegura que el JSON esté bien formado
      this.specCategories = this.parsedSpecs ? Object.keys(this.parsedSpecs) : [];
    } catch (e) {
      console.error('Error parsing product data:', e);
      // Resetea los valores en caso de JSON malformado
      this.parsedFeatures = [];
      this.parsedSpecs = null;
    }
  }

  // --- Métodos de Interacción ---

  goBack(): void {
    this.location.back();
  }

  incrementQuantity(): void { this.quantity++; }
  decrementQuantity(): void { if (this.quantity > 1) this.quantity--; }
  setActiveTab(tab: 'description' | 'specs'): void { this.activeTab = tab; }

  goToCart(): void {
    this.cartService.goToCart();
  }

  handleComprar(product: ProductoFinal): void {

    if (this.quantity < 1) {
      this.toastService.error('La cantidad debe ser al menos 1.');
      return;
    }

    if (this.quantity > 1000) {
      this.toastService.error('La cantidad no puede ser mayor a 1000.');
      return;
    }

    const addedSuccessfully = this.cartService.addToCart(product, this.quantity);

    if (addedSuccessfully) {
      console.log(`Producto ${product.nombre} añadido al carrito, cantidad: ${this.quantity}`);
      // Mostrar notificación de éxito
      this.toastService.success(`Añadido "${product.nombre.slice(0, 10)}" al carrito.`);
    } else {
      console.error('Error al añadir el producto al carrito');
      this.toastService.error('No se pudo añadir el producto al carrito. Inténtalo de nuevo.');
    }
  }

}
