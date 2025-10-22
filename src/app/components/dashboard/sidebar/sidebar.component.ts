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
  faWandSparkles
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
  templateUrl: './sidebar.component.html',
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
  faWandSparkles = faWandSparkles;

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
        key: 'lunai',
        label: 'Luna AI',
        icon: faWandSparkles,
        roles: [Role.Admin, Role.User],
        routerLink: '/dashboard/lunai',
      },
      {
        key: 'dashboard',
        label: 'Dashboard',
        icon: faTachometerAlt,
        roles: [Role.Admin, Role.User],
        routerLink: '/dashboard/home',
      },
      {
        key: 'proveedores',
        label: 'Proveedores',
        roles: [Role.Admin],
        icon: faCube,
        subItems: [
          { label: 'Ingram', routerLink: '/dashboard/add-ingram-products' },
          { label: 'Nexsys', routerLink: '/dashboard/add-nexsys-products' },
        ],
      },
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
        key: 'rmas',
        label: 'RMA Manager',
        roles: [Role.Admin, Role.User],
        icon: faFileLines,
        routerLink: '/dashboard/rmas',
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
        key: 'pagos',
        roles: [Role.Admin],
        label: 'Pagos',
        icon: faHandshake,
        routerLink: '/dashboard/payments'
        // requiresAuth: true, // Este item necesita que el usuario esté logueado
        // subItems: [
        //   { label: 'Ver Usuarios', routerLink: '/dashboard/users' },
        // ],
      },
      {
        key: 'shippings',
        roles: [Role.Admin],
        label: 'Envios',
        icon: faTruckFast,
        routerLink: '/dashboard/shippings'
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
