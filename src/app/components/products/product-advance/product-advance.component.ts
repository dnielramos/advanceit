import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
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
export class ProductAdvanceComponent {

  @Input() productosFiltrados: ProductoFinal[] = [];
  @Input() producto!: ProductoFinal;
  @Output() agregarAlCarrito = new EventEmitter<ProductoFinal>();

  logged: boolean = true;

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

  navigateToProductDetail(producto: ProductoFinal) {
    const productDetailUrl = `/productos/${producto.id}`;
    this.router.navigateByUrl(productDetailUrl);
  }

  addToCart(producto: ProductoFinal) {
    this.agregarAlCarrito.emit(producto);
  }

/**
 * ESTE ES EL GETTER DE LA SOLUCIÓN
 * Se asegura de que las etiquetas siempre sean un array iterable,
 * y devuelve como máximo 5 etiquetas seleccionadas aleatoriamente si hay más.
 */
get safeEtiquetas(): string[] {
  const etiquetas = this.producto.etiquetas;

  let etiquetasArray: string[] = [];

  // Caso 1: Los datos vienen como un string que parece un array
  if (typeof etiquetas === 'string') {
    try {
      const parsed = JSON.parse(etiquetas);
      etiquetasArray = Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      // Si no se puede parsear, dejamos el array vacío
      etiquetasArray = [];
    }
  }
  // Caso 2: Ya es un array o es null/undefined
  else if (Array.isArray(etiquetas)) {
    etiquetasArray = etiquetas;
  }

  // Si hay 5 o menos, devolver tal cual
  if (etiquetasArray.length <= 5) {
    return etiquetasArray;
  }

  // Si hay más de 5, seleccionar 5 aleatorias sin repetir
  const shuffled = [...etiquetasArray].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 4);
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
