import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  Output,
  EventEmitter,
  OnInit,
} from '@angular/core';
import { ProductAdvanceComponent } from '../product-advance/product-advance.component';
import { CartService } from '../../../services/cart.service';
import { ProductoFinal } from '../../../models/Productos';
import { ProductsService } from '../../../services/product.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-grid-products-store',
  standalone: true,
  imports: [CommonModule, ProductAdvanceComponent],
  templateUrl: './grid-products-store.component.html',
  // template: `
  //   <div
  //     class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4"
  //   >
  //     <app-product-advance
  //       *ngFor="let producto of productos$ | async"
  //       [producto]="producto"
  //       (añadirAlCarrito)="addToCart($event)"
  //     ></app-product-advance>
  //   </div>
  //   <div #sentinel class="h-10 w-full text-center py-4">
  //     <p class="text-gray-500">Cargando más productos...</p>
  //   </div>
  // `,
})
export class GridProductsStoreComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  // Ahora, los productos se obtienen del servicio a través de un Observable.
  // El 'async' pipe se encargará de suscribirse y desuscribirse.
  productos$!: Observable<ProductoFinal[]>;

  @Output() añadirAlCarrito: EventEmitter<ProductoFinal> = new EventEmitter();

  // El 'sentinel' es el elemento que el IntersectionObserver observará.
  @ViewChild('sentinel', { static: false }) sentinelRef!: ElementRef;
  private observer!: IntersectionObserver;

  constructor(
    private cartService: CartService,
    private productsService: ProductsService // Inyecta el nuevo servicio
  ) {}

  ngOnInit(): void {
    // Al inicializar el componente, obtenemos el Observable del servicio.
    this.productos$ = this.productsService.paginatedProducts$;

    // Y solicitamos la primera página de productos.
    // Esto iniciará el flujo de datos.
    this.productsService.getNextPage().subscribe();
  }

  ngAfterViewInit(): void {
    // Se configura el IntersectionObserver después de que la vista se inicializa.
    this.observer = new IntersectionObserver(
      ([entry]) => {
        // Si el sentinel es visible...
        if (entry.isIntersecting) {
          // ...solicitamos la siguiente página de productos al servicio.
          this.productsService.getNextPage().subscribe();
        }
      },
      {
        root: null, // El viewport es el elemento raíz.
        threshold: 0.1,
      }
    );

    // Comenzamos a observar el elemento 'sentinel' si está disponible.
    if (this.sentinelRef) {
      this.observer.observe(this.sentinelRef.nativeElement);
    }
  }

  ngOnDestroy(): void {
    // Es crucial dejar de observar el elemento para evitar fugas de memoria.
    if (this.observer && this.sentinelRef) {
      this.observer.unobserve(this.sentinelRef.nativeElement);
    }
  }

  addToCart(product: ProductoFinal) {
    const cantidad = parseInt(product.cantidad.toString()) || 1;
    this.añadirAlCarrito.emit(product);
  }
}
