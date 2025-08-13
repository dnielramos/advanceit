import { Component, OnInit } from '@angular/core';
import { CartService, CartItem } from '../../services/cart.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

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
  private apiUrlOrders = 'https://advance-genai.onrender.com/orders';

  constructor(private cartService: CartService, private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.cartService.getCart().subscribe((items) => {
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
    this.createOrder();
  }

  createOrder(): void {
    const productosSKU = this.cartItems.map((item) => item.product.SKU);
    const numeroOrden = 'ORD-' + Date.now(); // Puedes ajustar esta lógica
    const now = new Date();
    const fecha = now.toISOString().split('T')[0]; // yyyy-mm-dd
    const hora = now.toTimeString().split(' ')[0]; // hh:mm:ss
    const precioTotal = this.total;

    const nuevaOrden = {
      numeroOrden,
      fecha,
      hora,
      estadoPago: 'pendiente', // Asumimos pago inmediato por ahora
      precioTotal,
      productos: productosSKU,
      cliente: 'cliente-anónimo', // Cambiar si tienes login
      shippingNo: 'ENVIO-' + Date.now(), // Puedes mejorar esto
      notas: '', // O permitir que el usuario escriba algo
    };

    this.http.post(this.apiUrlOrders, nuevaOrden).subscribe({
      next: (response) => {
        alert('Orden creada con éxito');
        this.cartService.clearCart();
          this.router.navigate(['productos/orden-exitosa']); // Ruta al componente
      },
      error: (error) => {
        console.error('Error creando la orden', error);
        alert('Hubo un error al crear la orden');
      },
    });
  }

  // Continuar comprando
  continueShopping(): void {
    // Navega a la página de productos o emite un evento
    window.history.back();
  }
}
