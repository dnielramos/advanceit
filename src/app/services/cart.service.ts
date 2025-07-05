import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Producto } from '../models/Productos';

export interface CartItem {
  product: Producto;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  private cartItems: CartItem[] = [];

  constructor() {
    // Cargar carrito desde localStorage si existe
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      this.cartItems = JSON.parse(savedCart);
      this.cartSubject.next(this.cartItems);
    }
  }

  // Observable para suscribirse a cambios en el carrito
  getCart(): Observable<CartItem[]> {
    return this.cartSubject.asObservable();
  }

  // Añadir producto al carrito
  addToCart(product: Producto, quantity: number = 1): void {
    const existingItem = this.cartItems.find(item => item.product.id === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.cartItems.push({ product, quantity });
    }

    this.updateCart();
  }

  // Actualizar cantidad de un producto
  updateQuantity(productId: string, quantity: number): void {
    const item = this.cartItems.find(item => item.product.id === productId);
    if (item) {
      item.quantity = quantity;
      if (item.quantity <= 0) {
        this.removeFromCart(productId);
      }
      this.updateCart();
    }
  }

  // Eliminar producto del carrito
  removeFromCart(productId: string): void {
    this.cartItems = this.cartItems.filter(item => item.product.id !== productId);
    this.updateCart();
  }

  // Vaciar carrito
  clearCart(): void {
    this.cartItems = [];
    this.updateCart();
  }

  // Calcular total
  getTotal(): number {
    return this.cartItems.reduce((sum, item) => sum + (item.product.precio * item.quantity), 0);
  }

  // Persistir en localStorage
  private updateCart(): void {
    localStorage.setItem('cart', JSON.stringify(this.cartItems));
    this.cartSubject.next(this.cartItems);
  }
}
