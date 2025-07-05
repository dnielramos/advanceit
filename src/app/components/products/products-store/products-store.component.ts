import { CommonModule } from '@angular/common';
import { Component, Input, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { ProductAdvanceComponent } from "../product-advance/product-advance.component";

@Component({
  selector: 'app-grid-products-store',
  imports: [CommonModule, ProductAdvanceComponent],
  templateUrl: './grid-products-store.component.html',
})
export class GridProductsStoreComponent implements AfterViewInit, OnDestroy {
  @Input() productos: any[] = [];

  productosFiltrados: any[] = [];
  itemsPorPagina: number = 8; // 2 filas * 4 columnas
  paginaActual: number = 1;

  @ViewChild('sentinel', { static: false }) sentinelRef!: ElementRef;
  private observer!: IntersectionObserver;

  ngAfterViewInit(): void {
    this.cargarProductos();

    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          this.paginaActual++;
          this.cargarProductos();
        }
      },
      {
        root: null,
        threshold: 0.1,
      }
    );

    if (this.sentinelRef) {
      this.observer.observe(this.sentinelRef.nativeElement);
    }
  }

  ngOnDestroy(): void {
    if (this.observer && this.sentinelRef) {
      this.observer.unobserve(this.sentinelRef.nativeElement);
    }
  }

  cargarProductos(): void {
    const nuevosProductos = this.productos.slice(
      0,
      this.paginaActual * this.itemsPorPagina
    );
    this.productosFiltrados = nuevosProductos;
  }

  filteredProducts(): any[] {
    return this.productosFiltrados;
  }

  addToCart(product: any) {
    console.log('Producto añadido al carrito:', product);
  }
}
