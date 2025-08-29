import { NgClass, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faShoppingCart, faLanguage } from '@fortawesome/free-solid-svg-icons';
import { MobileMenuComponent } from './mobile-menu/mobile-menu.component';
import { TitleMegaMenuComponent } from '../../utils/title-mega-menu/title-mega-menu.component';
import { TrmComponent } from './trm/trm.component';
import { NavbarSectionsComponent } from './navbar-sections/navbar-sections.component';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ContextService } from '../../services/context.service';
import { filter } from 'rxjs/operators';
import { BuscadorPrincipalComponent } from '../products/buscador-principal/buscador-principal.component';
import { BuscadorNavbarComponent } from './buscador-navbar/buscador-navbar.component';
import { CategoryMenuComponent } from '../../pages/productos/categories/category.component';
import { BrandMenuComponent } from '../../pages/productos/brands/brand-menu.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterLink,
    FontAwesomeModule,
    NgClass,
    MobileMenuComponent,
    NgIf,
    TrmComponent,
    NavbarSectionsComponent,
    TranslatePipe,
    BuscadorNavbarComponent,
    CategoryMenuComponent,
    BrandMenuComponent,
  ],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  faGlobe = faLanguage;
  // faUser = faUser;
  // faHome = faHome;
  faShoppingCart = faShoppingCart;
  textIdiom = 'es';
  idiom = 'English';
  menuCategories: boolean = false;
  menuBrands: boolean = false;

  constructor(
    private translate: TranslateService,
    private contextService: ContextService,
    private router: Router
  ) {
    this.translate.addLangs(['es', 'en']);
    this.translate.setDefaultLang('es');
    this.translate.use('es');
  }

  showNav = false;

  ngOnInit(): void {
    // 1. Comprobación inicial al cargar
    const currentUrl = this.router.url;
    const isProductPage = currentUrl.startsWith('/productos');
    this.contextService.setNavVisibility(!isProductPage);

    // Escucha cambios de ruta
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const currentUrl = event.urlAfterRedirects;

        // Si la ruta es /productos, ocultar el navbar
        const isProductPageOrLogin = currentUrl.startsWith('/productos');
        this.contextService.setNavVisibility(!isProductPageOrLogin);
      });

    // Suscribirse al observable de visibilidad
    this.contextService.nav$.subscribe((value) => {
      this.showNav = value;
    });
  }

  cambiarIdioma() {
    this.textIdiom == 'es' ? (this.textIdiom = 'en') : (this.textIdiom = 'es');
    this.textIdiom == 'es'
      ? (this.idiom = 'English')
      : (this.idiom = 'Español');
    this.translate.use(this.textIdiom);
  }

  isMobileMenuOpen = false;

  isMegaMenuOpen: boolean = false;

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    document.body.classList.toggle('overflow-hidden', this.isMobileMenuOpen);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
    console.log('CERRAR MENU');
    document.body.classList.remove('overflow-hidden');
  }

  onMenucategories(): void {
    this.menuCategories = !this.menuCategories;

    const html = document.documentElement;
    const body = document.body;

    // if (this.menuCategories) {
    //   html.classList.add('no-scroll');
    //   body.classList.add('no-scroll');
    // } else {
    //   html.classList.remove('no-scroll');
    //   body.classList.remove('no-scroll');
    // }
  }

  onMenuBrands(): void {
    this.menuBrands = !this.menuBrands;

    const html = document.documentElement;
    const body = document.body;

    // if (this.menuBrands) {
    //   html.classList.add('no-scroll');
    //   body.classList.add('no-scroll');
    // } else {
    //   html.classList.remove('no-scroll');
    //   body.classList.remove('no-scroll');
    // }
  }

  onShowOtherBrand(): void {
    this.menuBrands = false;
    this.menuCategories = false;

    this.router.navigate(['/contacto']);
  }
}
