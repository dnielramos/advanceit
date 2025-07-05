import { Component, Input, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common'; // Importa CommonModule
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'; // Asumiendo que usas Font Awesome
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { ProductAdvanceComponent } from "../product-advance/product-advance.component"; // Importa los iconos específicos
import { Producto } from '../../../models/Productos';

// Asumiendo que tienes una interfaz para Product y el componente app-product-advance
// Si no tienes una interfaz, puedes definirla aquí o ajustarla a tu tipo de dato.
export interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  // Agrega otras propiedades de tu producto aquí
}

@Component({
  selector: 'app-slide-product-store',
  standalone: true, // Indica que es un componente standalone
  imports: [
    CommonModule, // Necesario para directivas como @for, *ngIf, etc.
    FontAwesomeModule,
    ProductAdvanceComponent
],
  templateUrl: './slide-product-store.component.html',
})
export class SlideProductStoreComponent {
  @Input() favoritesProducts: Producto[] = []; // El input que recibe los productos favoritos
  @Output() productAddedToCart = new EventEmitter<Producto>(); // Evento de salida para cuando un producto se añade al carrito

  @ViewChild('favoritesContainer') favoritesContainer!: ElementRef;

  faChevronLeft = faChevronLeft;
  faChevronRight = faChevronRight;

  // Método para el scroll horizontal
  scrollFavorites(direction: 'left' | 'right'): void {
    const container = this.favoritesContainer.nativeElement;
    const scrollAmount = 250; // Cantidad de píxeles a desplazar

    if (direction === 'left') {
      container.scrollBy({
        left: -scrollAmount,
        behavior: 'smooth'
      });
    } else {
      container.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  }

  // Método para manejar el evento agregarAlCarrito de app-product-advance
  addToCart(product: Producto): void {
    this.productAddedToCart.emit(product);
    console.log('Producto agregado al carrito desde slideProductStore:', product);
    // Aquí puedes añadir más lógica si necesitas hacer algo inmediatamente en este componente
  }
}
