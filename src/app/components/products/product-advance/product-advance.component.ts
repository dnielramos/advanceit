import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faSearch,
  faCopyright,
  faShoppingCart,
  faEye,
  faCheck,
  faLayerGroup,
  faTag,
  faCodeBranch,
  faWandSparkles
} from '@fortawesome/free-solid-svg-icons';
import { ProductoFinal } from '../../../models/Productos';
import { Router, RouterLink } from '@angular/router';
import { SanitizeImageUrlPipe } from '../../../pipes/sanitize-image-url.pipe';
import { AuthService, Role } from '../../../services/auth.service';
import { LogoPipe } from '../../../pipes/logo.pipe';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-advance',
  imports: [CommonModule, FontAwesomeModule, SanitizeImageUrlPipe, LogoPipe, FormsModule],
  templateUrl: './product-advance.component.html',
})
export class ProductAdvanceComponent implements OnChanges {

  @Input() productosFiltrados: ProductoFinal[] = [];
  @Input() producto!: ProductoFinal;
  @Output() agregarAlCarrito = new EventEmitter<ProductoFinal>();

   // 1. Crea una propiedad para almacenar las etiquetas que se mostrarán
  etiquetasMostradas: string[] = [];

// 2. Implementa el método ngOnChanges
  ngOnChanges(changes: SimpleChanges) {
    // Revisa si el input 'producto' ha cambiado
    if (changes['producto'] && changes['producto'].currentValue) {
      this.procesarEtiquetas();
    }
  }

  logged: boolean = true;

  faWandSparkles = faWandSparkles;
  faShoppingCart = faShoppingCart;
  faEye = faEye;
  faSearch = faSearch;
  faLayerGroup = faLayerGroup;
  faTag = faTag;
  faCopyright = faCopyright;
  faCodeBranch = faCodeBranch;
  faCircleCheck = faCheck;

  constructor(private authService: AuthService, private router: Router) {
    this.authService.isLoggedIn$.subscribe((isLoggedIn) => {
      this.logged = isLoggedIn;
    });
  }


  // 3. Mueve la lógica de procesamiento a una función separada
  private procesarEtiquetas() {
    const etiquetas = this.producto.etiquetas;
    let etiquetasArray: string[] = [];

    if (typeof etiquetas === 'string') {
      try {
        const parsed = JSON.parse(etiquetas);
        etiquetasArray = Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        etiquetasArray = [];
      }
    } else if (Array.isArray(etiquetas)) {
      etiquetasArray = etiquetas;
    }

    if (etiquetasArray.length <= 4) { // Nota: tu código original cortaba a 4, no a 5
      this.etiquetasMostradas = etiquetasArray;
    } else {
      // La lógica aleatoria se ejecuta UNA SOLA VEZ y se guarda
      const shuffled = [...etiquetasArray].sort(() => 0.5 - Math.random());
      this.etiquetasMostradas = shuffled.slice(0, 4);
    }
  }

  navigateToProductDetail(producto: ProductoFinal) {
    console.log('Navegar a detalle de producto:', producto);
    const productDetailUrl = `/productos/${producto.id}`;
    this.router.navigateByUrl(productDetailUrl);
  }

  addToCart(event: Event, producto: ProductoFinal) {

    //evitar propagacion de evento
    event.stopPropagation();
    console.log('Añadir al carrito:', producto);
    this.agregarAlCarrito.emit(producto);
  }

  get safeCaracteristicas(): string[] {
    const caracteristicas = this.producto["caracteristicas"];
    // Caso 1: Los datos vienen como un string que parece un array (el error actual)
    if (typeof caracteristicas === 'string') {
      try {
        const parsed = JSON.parse(caracteristicas);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        // Si no se puede parsear, devolvemos un array vacío para no romper la app
        return [];
      }
    }

    // Caso 2: Los datos vienen correctamente como un array (o son nulos/indefinidos)
    return Array.isArray(caracteristicas) ? caracteristicas : [];
  }

}
