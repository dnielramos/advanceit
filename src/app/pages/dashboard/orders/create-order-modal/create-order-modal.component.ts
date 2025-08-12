import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { OrdersService, Order, Product } from '../../../../services/orders.service';
import { NexsysProduct } from '../../../../models/Productos';

@Component({
  selector: 'app-create-order-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './create-order-modal.component.html',
})
export class CreateOrderModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() createOrder = new EventEmitter<Omit<Order, '_id'>>();

  // --- Iconos ---
  faTimes = faTimes;

  // --- Estado interno del formulario ---
  newOrderClient = '';
  newOrderNote = '';
  newOrderProducts: Product[] = [];
  newProductInput = '';
  productSearchResult: Product | null = null;
  productSearchError = '';

  constructor(private ordersService: OrdersService) {}

  // --- Lógica de Búsqueda de Productos ---
  searchProduct(): void {
    this.productSearchResult = null;
    this.productSearchError = '';
    if (!this.newProductInput.trim()) return;

    this.ordersService.searchProductBySku(this.newProductInput.trim()).subscribe({
      next: (product) => {
        if (product?.['data'].return) {
          this.productSearchResult = this.mapNexsysProductToProduct(product['data'].return[0]);
        } else {
          this.productSearchError = 'Producto no encontrado';
        }
      },
      error: () => {
        this.productSearchError = 'Producto no encontrado o error en la búsqueda.';
      },
    });
  }

  addProductToOrder(product: Product): void {
    this.newOrderProducts.push(product);
    this.newProductInput = '';
    this.productSearchResult = null;
    this.productSearchError = '';
  }

  removeProductFromOrder(index: number): void {
    this.newOrderProducts.splice(index, 1);
  }

  calculateTotal(): number {
    return this.newOrderProducts.reduce((acc, p) => acc + (p.precio || 0), 0);
  }

  // --- Lógica para Crear y Emitir la Orden ---
  submitOrder(): void {
    if (!this.newOrderClient.trim() || this.newOrderProducts.length === 0) {
      alert('El nombre del cliente y al menos un producto son obligatorios.');
      return;
    }

    const { fecha, hora } = this.getCurrentDateTime();
    const newOrderData: Omit<Order, '_id'> = {
      numeroOrden: this.generateOrderNumber(),
      fecha,
      hora,
      estadoPago: 'pendiente',
      precioTotal: this.calculateTotal(),
      productos: this.mapNexsysProductsToSkus(this.newOrderProducts),
      cliente: this.newOrderClient.trim(),
      shippingNo: `SH-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      notas: this.newOrderNote.trim(),
    };

    this.createOrder.emit(newOrderData);
  }

  // --- Métodos Privados de Ayuda ---
  private mapNexsysProductToProduct(nexsysProduct: NexsysProduct): Product {
    return {
      nombre: nexsysProduct.name,
      sku: nexsysProduct.sku,
      precio: nexsysProduct.price,
      _id: nexsysProduct.sku,
      category: nexsysProduct.category,
      currency: nexsysProduct.currency,
      image: nexsysProduct.image,
      inventory: nexsysProduct.inventory,
      long_description: nexsysProduct.long_description,
      mark: nexsysProduct.mark,
      parent: nexsysProduct.parent,
      short_description: nexsysProduct.short_description,
      tax_excluded: nexsysProduct.tax_excluded,
    };
  }

  private mapNexsysProductsToSkus(nexsysProducts: Product[]): string[] {
    return nexsysProducts.map((product) => product.sku);
  }

  private generateOrderNumber(): string {
    return `SH-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`;
  }

  private getCurrentDateTime(): { fecha: string; hora: string } {
    const now = new Date();
    const fecha = now.toISOString().split('T')[0];
    const hora = now.toTimeString().split(' ')[0];
    return { fecha, hora };
  }
}
