/*====================================================*/
/* SIDEBAR COMPONENT (sidebar.component.ts)           */
/*====================================================*/
import { Component, EventEmitter, Input, OnInit, Output, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faTachometerAlt,
  faCube,
  faUsers,
  faIcons,
  faDatabase,
  faGears,
  faChevronDown,
  faChevronRight,
  faTruckFast,
  faHandshake,
  faFileLines,
} from '@fortawesome/free-solid-svg-icons';
import { AuthService, Role } from '../../../services/auth.service'; // Asegúrate que la ruta sea correcta
import { Subscription } from 'rxjs';
import { User } from '../../../models/user';
import { UsersService } from '../../../services/users.service';

// Interfaz para definir la estructura de cada item del menú
interface MenuItem {
  key: string;
  label: string;
  icon: any;
  roles: Role[];
  routerLink?: string;
  subItems?: SubMenuItem[];
  requiresAuth?: boolean; // Propiedad para controlar la visibilidad
}

// Interfaz para los sub-items
interface SubMenuItem {
  label: string;
  routerLink: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FontAwesomeModule],
  template: `
    <div
      class="transition-all flex flex-col py-2 shadow-md h-full bg-white"
      [ngClass]="{
        'w-48': !isToggleSidebarDesktop,
        'w-20 items-center': isToggleSidebarDesktop
      }"
      (mouseenter)="onMouseEnter()"
      (mouseleave)="onMouseLeave()"
    >
      <div
        class="flex py-2 items-center px-4 space-x-2"
        [ngClass]="{ 'opacity-0': isToggleSidebarDesktop }"
      >
        <img class="h-10" src="logo.png" alt="Logo" />
      </div>

      <div class="px-4 py-2 flex items-center space-x-3">
        <img
          src="{{ userActive.picture }}"
          alt="User Avatar"
          class="w-10 h-10 rounded-full"
        />
        <div class="leading-tight pt-2" *ngIf="!isToggleSidebarDesktop">
          <p class="font-semibold text-gray-700 text-sm">{{ userActive.name }}</p>
          <p class="text-xs text-purple-600">{{ userActive.company }}</p>
        </div>
      </div>

      <hr class="my-2 border-t border-gray-200" />

      <nav class="flex-1 overflow-y-auto px-2">
        <ng-container *ngFor="let item of menuItems">
          <a
            *ngIf="!item.subItems && authService.hasRole(item.roles)"
            [routerLink]="item.routerLink"
            routerLinkActive="bg-purple-100 text-purple-700"
            class="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            <fa-icon [icon]="item.icon" class="w-5 text-center text-gray-500" [class.router-link-active]="'text-purple-700'"></fa-icon>
            <span *ngIf="!isToggleSidebarDesktop" class="text-gray-800 font-semibold text-sm">{{ item.label }}</span>
          </a>

          <div *ngIf="item.subItems" class="mt-2">
            <button
              (click)="toggleDropdown(item.key)"
              class="w-full flex items-center justify-between space-x-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              [ngClass]="{ 'bg-gray-100': openDropdowns[item.key] }"
            >
              <div class="flex items-center space-x-3">
                <fa-icon [icon]="item.icon" class="w-5 text-center text-gray-500"></fa-icon>
                <span *ngIf="!isToggleSidebarDesktop" class="text-gray-800 font-semibold text-sm">{{ item.label }}</span>
              </div>
              <fa-icon
                *ngIf="!isToggleSidebarDesktop"
                [icon]="openDropdowns[item.key] ? faChevronDown : faChevronRight"
                class="text-gray-400 w-3"
              ></fa-icon>
            </button>

            <div
              *ngIf="openDropdowns[item.key] && !isToggleSidebarDesktop"
              class="pl-8 flex flex-col space-y-1 mt-1 animate__animated animate__fadeIn"
            >
              <a
                *ngFor="let subItem of item.subItems"
                [routerLink]="subItem.routerLink"
                routerLinkActive="text-purple-600 font-medium"
                class="block py-1.5 px-3 text-sm text-gray-600 hover:text-purple-600 rounded-md"
              >
                {{ subItem.label }}
              </a>
            </div>
          </div>
        </ng-container>
      </nav>

      <!-- <div *ngIf="!isToggleSidebarDesktop" class="p-4 mt-auto">
        <a
          routerLink="/dashboard/settings"
          routerLinkActive="text-purple-600"
          class="flex items-center justify-center space-x-2 text-sm text-gray-600 hover:text-purple-600 transition-colors duration-200"
        >
          <fa-icon [icon]="faGears" class="text-gray-500"></fa-icon>
          <span>Configuración</span>
        </a>
      </div> -->
    </div>
  `,
})
export class SidebarComponent implements OnInit, OnDestroy {
  // Icon mapping
  faTachometerAlt = faTachometerAlt;
  faChevronDown = faChevronDown;
  faChevronRight = faChevronRight;
  faGears = faGears;
  faUsers = faUsers;
  faCube = faCube;
  faHandshake = faHandshake;
  faTruckFast = faTruckFast;
  faFileLines = faFileLines;

  private authSubscription!: Subscription;

  // Inputs & Outputs
  @Input() isToggleSidebarDesktop: boolean = false;
  @Output() changeWithSideBar = new EventEmitter<void>();

  public openDropdowns: { [key: string]: boolean } = {};
  public menuItems: MenuItem[] = []; // Se inicializa vacío y se construye dinámicamente

  public userActive !: User;

  constructor(protected authService: AuthService, userService: UsersService) {

    authService.isLoggedIn$.subscribe((isLoggedIn) => {
      if (isLoggedIn) {
        userService.getUserById(authService.getUserId()!).subscribe((user) => {
          this.userActive = user;

          console.log(this.userActive, 'USER ACTIVE');
        });
      }
    });
  }

  ngOnInit(): void {
    // Nos suscribimos al estado de login del servicio de autenticación
    this.authSubscription = this.authService.isLoggedIn$.subscribe(isLoggedIn => {
      this.buildMenu(isLoggedIn); 
    });

  }

  ngOnDestroy(): void {
    // Limpiamos la suscripción para evitar fugas de memoria
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  private buildMenu(isLoggedIn: boolean): void {
    const allMenuItems: MenuItem[] = [
      {
        key: 'dashboard',
        label: 'Dashboard',
        icon: faTachometerAlt,
        roles: [Role.Admin, Role.User],
        routerLink: '/dashboard/home',
      },
      // {
      //   key: 'proveedores',
      //   label: 'Proveedores',
      //   icon: faCube,
      //   requiresAuth: true, // Este item necesita que el usuario esté logueado
      //   subItems: [
      //     { label: 'Ingram', routerLink: '/dashboard/add-ingram-products' },
      //     { label: 'Nexsys', routerLink: '/dashboard/add-nexsys-products' },
      //   ],
      // },
      {
        key: 'tienda',
        label: 'Tienda',
        icon: faIcons,
        roles: [Role.Admin, Role.User],
        subItems: [
          { label: 'Buscar productos', routerLink: '/dashboard/advance-products' },
        ],
      },
      {
        key: 'ordenes',
        label: 'Órdenes',
        roles: [Role.Admin, Role.User],
        icon: faDatabase,
        routerLink: '/dashboard/orders',
        // subItems: [
        //   { label: 'Ver Órdenes', routerLink: '/dashboard/orders' },
        // ],
      },
      {
        key: 'cotizaciones',
        label: 'Cotizaciones',
        roles: [Role.Admin, Role.User],
        icon: faFileLines,
        routerLink: '/dashboard/cotizaciones',
        // subItems: [
        //   { label: 'Ver Órdenes', routerLink: '/dashboard/orders' },
        // ],
      },
      {
        key: 'usuarios',
        roles: [Role.Admin],
        label: 'Usuarios',
        icon: faUsers,
        routerLink: '/dashboard/users'
        // requiresAuth: true, // Este item necesita que el usuario esté logueado
        // subItems: [
        //   { label: 'Ver Usuarios', routerLink: '/dashboard/users' },
        // ],
      },
      {
        key: 'empresas',
        roles: [Role.Admin],
        label: 'Empresas',
        icon: faHandshake,
        routerLink: '/dashboard/companies'
        // requiresAuth: true, // Este item necesita que el usuario esté logueado
        // subItems: [
        //   { label: 'Ver Usuarios', routerLink: '/dashboard/users' },
        // ],
      },
      {
        key: 'logistica',
        roles: [Role.Admin],
        label: 'Logística',
        icon: faTruckFast,
        routerLink: '/dashboard/logistica'
        // requiresAuth: true, // Este item necesita que el usuario esté logueado
        // subItems: [
        //   { label: 'Ver Usuarios', routerLink: '/dashboard/users' },
        // ],
      },
      // {
      //   key: 'configuracion',
      //   label: 'Configuración',
      //   icon: faGears,
      //   routerLink: '/dashboard/settings',
      //   // requiresAuth: true, // Este item necesita que el usuario esté logueado
      // }
    ];

    // Filtramos los items del menú basados en el estado de login
    this.menuItems = allMenuItems.filter(item => !item.requiresAuth || isLoggedIn);
  }

  private wasCollapsedOnHover: boolean = false;

  toggleDropdown(menuKey: string): void {
    const currentState = this.openDropdowns[menuKey];
    Object.keys(this.openDropdowns).forEach(key => {
        this.openDropdowns[key] = false;
    });
    this.openDropdowns[menuKey] = !currentState;
  }

  onMouseEnter(): void {
    if (this.isToggleSidebarDesktop) {
      this.isToggleSidebarDesktop = false;
      this.wasCollapsedOnHover = true;
      this.changeWithSideBar.emit();
    }
  }

  onMouseLeave(): void {
    if (this.wasCollapsedOnHover) {
      this.isToggleSidebarDesktop = true;
      this.wasCollapsedOnHover = false;
      this.closeAllSubmenus();
      this.changeWithSideBar.emit();
    }
  }

  closeAllSubmenus(): void {
    this.openDropdowns = {};
  }
}
