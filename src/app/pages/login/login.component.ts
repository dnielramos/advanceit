import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FaIconLibrary, FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faUser, faLock } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, FaIconComponent],
  template: `
    <div class="hero-sectionS mt-10 flex bg-linear-to-b from-white to-purple-200 items-center justify-center">
      <div class="container mx-auto px-4 pt-16 pb-32 flex flex-col items-center justify-center">

        <!-- Logo de la aplicación -->
         <img
          src="logo.png"
          alt="Logo"
          class="h-12 mb-8"
        />

        <!-- Tarjeta de login -->
        <div class="bg-white rounded-4xl shadow-xl p-8 w-full max-w-md">
          <h2 class="text-3xl font-bold text-center text-orange-500 mb-6">
            Inicio de Sesión
          </h2>
          <form (ngSubmit)="onLogin()">
            <!-- Campo correo -->
            <div class="mb-4">
              <label class="block text-purple-700 mb-2" for="email">Correo electrónico</label>
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
                  [(ngModel)]="email"
                  name="email"
                  required
                />
              </div>
            </div>
            <!-- Campo contraseña -->
            <div class="mb-6">
              <label class="block text-purple-700 mb-2" for="password">Contraseña</label>
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
                  [(ngModel)]="password"
                  name="password"
                  required
                />
              </div>
            </div>
            <!-- Botón de inicio de sesión -->
            <button
              type="submit"
              RouterLink="/"
              class="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-800 hover:to-orange-600 text-white py-3 rounded-lg font-medium transition-transform transform hover:scale-105"
            >
              Iniciar Sesión
            </button>
          </form>
          <div class="text-center mt-4">
            <a routerLink="/registro" class="text-purple-600 hover:underline">
              ¿Olvidaste tu contraseña?
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .hero-sectionS {
      min-height: calc(100vh - 64px);
      position: relative;
      overflow: hidden;
    }
  `]
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  faUser = faUser;
  faLock = faLock;

  constructor(private router: Router, library: FaIconLibrary) {
    library.addIcons(faUser, faLock);
  }

  onLogin(): void {
    // Aquí implementas la lógica real de autenticación
    console.log('Email:', this.email);
    console.log('Password:', this.password);
    // Simulamos la navegación al dashboard tras el login
    this.router.navigate(['/dashboard']);
  }
}
