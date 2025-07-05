import { Component, OnInit } from '@angular/core';
import { CartService, CartItem } from '../../services/cart.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './cart.component.html',
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  total: number = 0;
  couponCode: string = '';
  discount: number = 0;

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.cartService.getCart().subscribe(items => {
      this.cartItems = items;
      this.total = this.cartService.getTotal();
    });
  }

  // Actualiza la cantidad de un producto
  updateQuantity(productId: string, quantity: number): void {
    if (quantity < 1) quantity = 1;
    this.cartService.updateQuantity(productId, quantity);
    this.total = this.cartService.getTotal(); // Recalcula el total
  }

  // Incrementa cantidad
  increaseQuantity(item: CartItem): void {
    this.updateQuantity(item.product.id, item.quantity + 1);
  }

  // Decrementa cantidad
  decreaseQuantity(item: CartItem): void {
    if (item.quantity > 1) {
      this.updateQuantity(item.product.id, item.quantity - 1);
    }
  }

  // Elimina un producto del carrito
  removeFromCart(productId: string): void {
    this.cartService.removeFromCart(productId);
    this.total = this.cartService.getTotal(); // Recalcula el total
  }

  // Aplica cupón (ejemplo básico)
  applyCoupon(): void {
    if (this.couponCode.toLowerCase() === 'advance') {
      this.discount = this.total * 0.2; // 20% de descuento
      this.total = this.total - this.discount;
    } else {
      this.discount = 0;
      this.total = this.cartService.getTotal(); // Restablece el total
    }
  }

  // Finaliza la compra
  checkout(): void {
    alert('Funcionalidad de pago pendiente');
  }

  // Continuar comprando
  continueShopping(): void {
    // Navega a la página de productos o emite un evento
    window.history.back();
  }
}
