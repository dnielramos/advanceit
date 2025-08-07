import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  FaIconLibrary,
  FaIconComponent,
} from '@fortawesome/angular-fontawesome';
import { faUser, faLock } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../services/auth.service'; // <-- Asegúrate que la ruta sea correcta
import { AngularToastifyModule, ToastService } from 'angular-toastify';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, // Necesario para *ngIf
    FormsModule, // Necesario para ngModel, ngForm, etc.
    RouterLink, // Necesario para routerLink
    FaIconComponent, // Necesario para <fa-icon>
    AngularToastifyModule,
  ],
  template: `
    <div
      class="hero-sectionS mt-10 flex bg-linear-to-b from-white to-purple-200 items-center justify-center"
    >
      <lib-toastify-toast-container class="bg-white" [iconLibrary]="'font-awesome'"></lib-toastify-toast-container>

      <div
        class="container mx-auto px-4 pt-16 pb-32 flex flex-col items-center justify-center"
      >
        <!-- Logo -->
        <img
          src="logo.png"
          alt="Logo"
          class="h-12 mb-8"
          onerror="this.onerror=null;this.src='https://placehold.co/200x50/FFFFFF/E18542?text=Logo'"
        />

        <!-- Tarjeta de login -->
        <div class="bg-white rounded-4xl shadow-xl p-8 w-full max-w-md">
          <h2 class="text-3xl font-bold text-center text-orange-500 mb-6">
            Inicio de Sesión
          </h2>

          <!-- El (ngSubmit) ahora llama a onLogin y pasa la referencia del formulario #loginForm -->
          <form #loginForm="ngForm" (ngSubmit)="onLogin(loginForm)">
            <!-- Campo correo -->
            <div class="mb-4">
              <label class="block text-purple-700 mb-2" for="email"
                >Correo electrónico</label
              >
              <div class="relative">
                <fa-icon
                  [icon]="faUser"
                  class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                ></fa-icon>
                <input
                  id="email"
                  type="email"
                  class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                  placeholder="correo@ejemplo.com"
                  [(ngModel)]="credentials.email"
                  name="email"
                  required
                  email
                  #emailInput="ngModel"
                />
              </div>
              <!-- Mensaje de error para el correo -->
              <div
                *ngIf="
                  emailInput.invalid && (emailInput.dirty || emailInput.touched)
                "
                class="text-red-500 text-sm mt-1"
              >
                <div *ngIf="emailInput.errors?.['required']">
                  El correo es obligatorio.
                </div>
                <div *ngIf="emailInput.errors?.['email']">
                  Por favor, introduce un correo válido.
                </div>
              </div>
            </div>

            <!-- Campo contraseña -->
            <div class="mb-6">
              <label class="block text-purple-700 mb-2" for="password"
                >Contraseña</label
              >
              <div class="relative">
                <fa-icon
                  [icon]="faLock"
                  class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                ></fa-icon>
                <input
                  id="password"
                  type="password"
                  class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                  placeholder="********"
                  [(ngModel)]="credentials.password"
                  name="password"
                  required
                  #passwordInput="ngModel"
                />
              </div>
              <!-- Mensaje de error para la contraseña -->
              <div
                *ngIf="
                  passwordInput.invalid &&
                  (passwordInput.dirty || passwordInput.touched)
                "
                class="text-red-500 text-sm mt-1"
              >
                <div *ngIf="passwordInput.errors?.['required']">
                  La contraseña es obligatoria.
                </div>
              </div>
            </div>

            <!-- Botón de inicio de sesión -->
            <!-- Se quita RouterLink. La navegación se hace en el TypeScript después del éxito. -->
            <button
              type="submit"
              [disabled]="loginForm.invalid || isLoading"
              class="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-800 hover:to-purple-600 text-white py-3 rounded-lg font-medium transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isLoading ? 'Iniciando...' : 'Iniciar Sesión' }}
            </button>

            <!-- Botón para crear cuenta. Se cambia a type="button" para que no envíe el formulario. -->
            <button
              type="button"
              (click)="goToRegister()"
              class="w-full bg-gradient-to-r mt-4 from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white py-3 rounded-lg font-medium transition-transform transform hover:scale-105"
            >
              Crear una cuenta de Advance
            </button>
          </form>

          <div class="text-center mt-4">
            <!-- Se cambia el routerLink para que sea más apropiado -->
            <a
              (click)="showForgotPasswordModal()"
              class="text-purple-600 hover:underline cursor-pointer"
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>
        </div>
      </div>

      <!-- Modal simple para "Olvidé mi contraseña" -->
      <div
        *ngIf="forgotPassword"
        class="fixed inset-0 bg-black/60 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50"
      >
        <div class="bg-white p-8 rounded-lg shadow-xl text-center">
          <h3 class="text-xl font-bold mb-4">Restablecer Contraseña</h3>
          <p class="mb-6">
            Por favor, contacta a un administrador para que te ayude a
            restablecer tu contraseña.
          </p>
          <button
            (click)="forgotPassword = false"
            class="bg-purple-500 text-white py-2 px-6 rounded-lg"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .hero-sectionS {
        min-height: calc(100vh - 64px);
        position: relative;
        overflow: hidden;
      }
      .rounded-4xl {
        border-radius: 2rem; /* 32px */
      }
    `,
  ],
})
export class LoginComponent {
  // --- Propiedades del Componente ---

  // Objeto para almacenar los datos del formulario con ngModel
  credentials = {
    email: '',
    password: '',
  };

  // Banderas para controlar el estado de la UI
  isLoading = false;
  forgotPassword = false;

  // Iconos de FontAwesome
  faUser = faUser;
  faLock = faLock;

  // --- Inyección de Dependencias (Estilo moderno con inject()) ---
  private http = inject(HttpClient);
  private router = inject(Router);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  // URL de la API (es buena práctica mover esto a un archivo de environment)
  private readonly apiUrl = 'http://localhost:3002/auth/login'; // <-- ¡Verifica tu puerto!

  constructor(library: FaIconLibrary) {
    // Agrega los iconos a la librería para que estén disponibles en el template
    library.addIcons(faUser, faLock);
  }

  // --- Métodos del Componente ---

  /**
   * Se ejecuta al enviar el formulario de login.
   * @param form La instancia del formulario para verificar su validez.
   */
  onLogin(form: NgForm): void {
    // Doble verificación: si el formulario no es válido, no hacer nada.
    if (form.invalid) {
      // Marca todos los campos como "tocados" para mostrar los mensajes de error.
      Object.values(form.controls).forEach((control) =>
        control.markAsTouched()
      );
      return;
    }

    this.isLoading = true; // Activa el estado de carga

    // Llamada HTTP al backend de NestJS
    this.http
      .post<{ access_token: string }>(this.apiUrl, this.credentials)
      .subscribe({
        // Se ejecuta si la petición es exitosa (status 2xx)
        next: (response) => {
          console.log('Login exitoso, token recibido.');
          // Usa el AuthService para guardar el token y actualizar el estado de la app
          this.authService.handleLogin(response.access_token);
          // Redirige al usuario a la página principal o dashboard
          // this.router.navigate(['/dashboard']);
        },
        // Se ejecuta si hay un error en la petición
        error: (err) => {
          console.error('Error durante el inicio de sesión:', err);
          // Muestra un mensaje de error al usuario
          this.toastService.error(
            err.error.message ||
              'Credenciales inválidas. Por favor, intenta de nuevo.'
          );
          this.isLoading = false; // Desactiva el estado de carga en caso de error
        },
        // Se ejecuta siempre, al finalizar la petición (éxito o error)
        complete: () => {
          this.isLoading = false;
        },
      });
  }

  /**
   * Navega a la página de registro.
   */
  goToRegister(): void {
    this.router.navigate(['/registro']); // <-- Asegúrate que esta ruta exista en tu routing
  }

  /**
   * Muestra el modal de "Olvidé mi contraseña".
   */
  showForgotPasswordModal(): void {
    this.forgotPassword = true;
  }
}
