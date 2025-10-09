import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ProductoFinal } from '../models/Productos';

export interface CartItem {
  product: ProductoFinal;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  public cartItems: CartItem[] = [];
  private cartCount = new BehaviorSubject<number>(0);

  constructor() {
    // Cargar carrito desde localStorage si existe
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      this.cartItems = JSON.parse(savedCart);
      this.cartSubject.next(this.cartItems);

      //calculat el total de la cantidad de los productos
      this.cartCount.next(this.cartItems.reduce((total, item) => total + item.quantity, 0));
    }
  }

  // Observable para suscribirse a cambios en el carrito
  getCart(): Observable<CartItem[]> {
    return this.cartSubject.asObservable();
  }


  getCartCount(): Observable<number> {
    return this.cartCount.asObservable();
  }

  // Añadir producto al carrito
  addToCart(product: ProductoFinal, quantity: number = 1): boolean {
    const existingItem = this.cartItems.find(item => item.product.id === product.id);


    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.cartItems.push({ product, quantity });
    }

    try {
      this.updateCart();
      //actualizar el contador
      this.cartCount.next(this.cartItems.reduce((total, item) => total + item.quantity, 0));
      return true; // Indicar que se ha añadido correctamente

    } catch (error) {
      console.error('Error al añadir producto al carrito:', error);
      // Aquí podrías manejar el error, por ejemplo, mostrando un mensaje al usuario
      return false;

    }

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
    //actualizar el contador
    this.cartCount.next(this.cartItems.reduce((total, item) => total + item.quantity, 0));
  }

  // Vaciar carrito
  clearCart(): void {
    this.cartItems = [];
    this.updateCart();
    //actualizar el contador
    this.cartCount.next(this.cartItems.reduce((total, item) => total + item.quantity, 0));
  }

  // Calcular total
  getTotal(): number {
    return this.cartItems.reduce((sum, item) => sum + ((item.product.precio ?? 0) * item.quantity), 0);
  }

  // Persistir en localStorage
  private updateCart(): void {
    localStorage.setItem('cart', JSON.stringify(this.cartItems));
    this.cartSubject.next(this.cartItems);
  }
}
