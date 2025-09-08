/*==================================*/
/*   TOPBAR COMPONENT (topbar.component.ts)   */
/*==================================*/
import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faBars,
  faBell,
  faEnvelope,
  faSearch,
  faArrowRightFromBracket,
  faHome
} from '@fortawesome/free-solid-svg-icons';
import { TrmComponent } from "../../navbar/trm/trm.component";
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, TrmComponent],
  template: `
    <div class="h-16 bg-white shadow px-4 z-9999 flex sticky top-0 items-center justify-between">
      <div class="flex items-center space-x-4">
        <!-- Botón hamburguesa para mostrar/ocultar sidebar en móvil -->
        <button
          class="p-2 text-gray-600 hover:bg-gray-100 lg:hidden rounded focus:outline-none md:hidden"
          (click)="toggleSidebarMobile.emit()"
        >
          <fa-icon [icon]="faBars" class="text-xl"></fa-icon>
        </button>

        <app-trm></app-trm>

      </div>

      <div class="flex items-center">

        <!-- <button class="relative p-2 text-gray-600 hover:bg-gray-100 rounded focus:outline-none">
          <fa-icon [icon]="faBell" class="text-lg"></fa-icon>
          <span
            class="absolute top-1 right-1 bg-red-400 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full"
            >2</span
          >
        </button> -->

        <button (click)="home()" class="relative text-purple-500 p-2 text-gray-600 hover:bg-gray-100 rounded focus:outline-none">
          <fa-icon [icon]="faHome" class="text-lg" title="Regresar a la página de inicio"></fa-icon>
        </button>

        <button (click)="logout()" class="relative p-2 text-xs align-middle items-center flex gap-2 text-gray-600 hover:bg-gray-100 rounded focus:outline-none">
          <fa-icon [icon]="faArrowRightFromBracket" class="text-lg" title="Cerrar sesión"></fa-icon>
          Cerrar sesión       
        </button>


      </div>
    </div>
  `,
  styles: []
})
export class TopbarComponent {
  faBars = faBars;
  faSearch = faSearch;
  faBell = faBell;
  faEnvelope = faEnvelope;
  faArrowRightFromBracket = faArrowRightFromBracket;
  faHome = faHome;

  @Output() toggleSidebarMobile = new EventEmitter<void>();
  @Output() toggleSidebarDesktop = new EventEmitter<void>();

  constructor(private authService: AuthService, private router: Router) {
    this.authService.isLoggedIn$.subscribe((isLoggedIn) => {
      if (!isLoggedIn) {
        this.router.navigate(['in']);
      }
    });
  }

  logout() {

    if (confirm('¿Está seguro de cerrar sesión?')) {
      this.authService.logout();
      this.router.navigate(['in'], { replaceUrl: true });
    }
  }

  home() {
    this.router.navigate(['productos']);
  }
}
