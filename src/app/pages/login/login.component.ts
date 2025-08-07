import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  FaIconLibrary,
  FaIconComponent,
} from '@fortawesome/angular-fontawesome';
import {
  faUser,
  faLock,
  faCircleCheck,
} from '@fortawesome/free-solid-svg-icons'; // <-- 1. Importa el ícono de check
import { AuthService } from '../../services/auth.service';
import { AngularToastifyModule, ToastService } from 'angular-toastify';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    FaIconComponent,
    AngularToastifyModule,
  ],
  template: `
    <div
      class="hero-sectionS mt-10 flex bg-linear-to-b from-white to-purple-200 items-center justify-center"
    >
      <lib-toastify-toast-container
        [iconLibrary]="'font-awesome'"
      ></lib-toastify-toast-container>

      <div
        class="container mx-auto px-4 pt-16 pb-32 flex flex-col items-center justify-center"
      >
        <!-- Logo -->

        <!-- Contenedor principal que cambia entre el formulario y el mensaje de éxito -->
        <div
          class="bg-white rounded-4xl shadow-xl p-8 w-full max-w-md transition-all duration-500"
        >
          <!-- FORMULARIO DE LOGIN (se muestra si loginSuccess es falso) -->
          <div *ngIf="!loginSuccess">
            <div class="flex justify-center">
              <img
                src="logo.png"
                alt="Logo"
                class="h-12 mb-8"
                onerror="this.onerror=null;this.src='https://placehold.co/200x50/FFFFFF/E18542?text=Logo'"
              />
            </div>
            <h2 class="text-2xl font-bold text-center text-orange-500 mb-6">
              Inicio de sesion
            </h2>
            <form #loginForm="ngForm" (ngSubmit)="onLogin(loginForm)">
              <!-- Campos del formulario (sin cambios) -->

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
                    class="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-purple-500"
                    placeholder="correo@ejemplo.com"
                    [(ngModel)]="credentials.email"
                    name="email"
                    required
                    email
                    #emailInput="ngModel"
                  />
                </div>
                <div
                  *ngIf="
                    emailInput.invalid &&
                    (emailInput.dirty || emailInput.touched)
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
                    class="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-purple-500"
                    placeholder="********"
                    [(ngModel)]="credentials.password"
                    name="password"
                    required
                    #passwordInput="ngModel"
                  />
                </div>
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
              <button
                type="submit"
                [disabled]="loginForm.invalid || isLoading"
                class="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-800 hover:to-purple-600 text-white py-3 rounded-lg font-medium transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ isLoading ? 'Iniciando...' : 'Iniciar Sesión' }}
              </button>
              <button
                type="button"
                (click)="goToRegister()"
                class="w-full bg-gradient-to-r mt-4 from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white py-3 rounded-lg font-medium transition-transform transform hover:scale-105"
              >
                Crear una cuenta de Advance
              </button>
            </form>
            <div class="text-center mt-4">
              <a
                (click)="showForgotPasswordModal()"
                class="text-purple-600 hover:underline cursor-pointer"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          </div>

          <!-- MENSAJE DE ÉXITO (se muestra si loginSuccess es verdadero) -->
          <div *ngIf="loginSuccess" class="text-center py-8 animate-fade-in">
            <fa-icon
              [icon]="faCircleCheck"
              class="text-green-500 text-6xl mb-4"
            ></fa-icon>
            <h2 class="text-3xl font-bold text-gray-800">¡Bienvenido!</h2>
            <p class="text-gray-600 mt-2">Serás redirigido en un momento...</p>
          </div>
        </div>
      </div>

      <!-- Modal "Olvidé mi contraseña" (sin cambios) -->
      <div
        *ngIf="forgotPassword"
        class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
      >
        <div class="bg-white p-8 rounded-lg shadow-xl text-center">
          <h3 class="text-xl font-bold mb-4">Restablecer Contraseña</h3>
          <p class="mb-6">
            Por favor, contacta a un administrador para que te ayude.
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
      /* Animación simple para el mensaje de bienvenida */
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: scale(0.95);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
      .animate-fade-in {
        animation: fadeIn 0.5s ease-out forwards;
      }
    `,
  ],
})
export class LoginComponent {
  // --- Propiedades del Componente ---
  credentials = { email: '', password: '' };
  isLoading = false;
  forgotPassword = false;
  loginSuccess = false; // <-- 2. Nueva bandera para controlar la vista

  // Iconos
  faUser = faUser;
  faLock = faLock;
  faCircleCheck = faCircleCheck; // <-- Agrega el nuevo ícono

  // --- Inyección de Dependencias ---
  private http = inject(HttpClient);
  private router = inject(Router);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  private readonly apiUrl = 'http://localhost:3002/auth/login';

  constructor(library: FaIconLibrary) {
    // 3. Agrega todos los íconos a la librería
    library.addIcons(faUser, faLock, faCircleCheck);
  }

  // --- Métodos del Componente ---
  onLogin(form: NgForm): void {
    if (form.invalid) {
      Object.values(form.controls).forEach((control) =>
        control.markAsTouched()
      );
      return;
    }

    this.isLoading = true;

    this.http
      .post<{ access_token: string }>(this.apiUrl, this.credentials)
      .subscribe({
        next: (response) => {
          // --- 4. Lógica de éxito actualizada ---
          console.log('Login exitoso, token recibido.');
          this.authService.handleLogin(response.access_token);

          form.resetForm();
          this.loginSuccess = true;

          // Configura la redirección después de 3 segundos
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 3000);
        },
        error: (err) => {
          console.error('Error durante el inicio de sesión:', err);
          // Usa el servicio de toast para los errores
          this.toastService.error(
            err.error.message ||
              'Credenciales inválidas. Por favor, intenta de nuevo.'
          );
          this.isLoading = false;
        },
        // El bloque complete ya no es necesario aquí, ya que isLoading se maneja en error y éxito
      });
  }

  goToRegister(): void {
    this.router.navigate(['/registro']);
  }

  showForgotPasswordModal(): void {
    this.forgotPassword = true;
  }
}
