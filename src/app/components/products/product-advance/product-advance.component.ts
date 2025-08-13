import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faSearch,
  faCopyright,
  faShoppingCart,
  faEye,
  faLayerGroup,
  faTag,
  faCodeBranch,
} from '@fortawesome/free-solid-svg-icons';
import { ProductoFinal } from '../../../models/Productos';
import { RouterLink } from '@angular/router';
import { SanitizeImageUrlPipe } from '../../../pipes/sanitize-image-url.pipe';
import { AuthService, Role } from '../../../services/auth.service';

@Component({
  selector: 'app-product-advance',
  imports: [CommonModule, FontAwesomeModule, SanitizeImageUrlPipe],
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
  faCopririgth = faCopyright;
  faCodeBranch = faCodeBranch;

  constructor(private authService: AuthService) {
    this.logged = this.authService.hasRole(Role.User);
  }

  addToCart(producto: ProductoFinal) {
    this.agregarAlCarrito.emit(producto);
  }

  /**
   * ESTE ES EL GETTER DE LA SOLUCIÓN
   * Se asegura de que las etiquetas siempre sean un array iterable.
   */
  get safeEtiquetas(): string[] {
    const etiquetas = this.producto.etiquetas;

    // Caso 1: Los datos vienen como un string que parece un array (el error actual)
    if (typeof etiquetas === 'string') {
      try {
        const parsed = JSON.parse(etiquetas);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        // Si no se puede parsear, devolvemos un array vacío para no romper la app
        return [];
      }
    }

    // Caso 2: Los datos vienen correctamente como un array (o son nulos/indefinidos)
    return Array.isArray(etiquetas) ? etiquetas : [];
  }
}
