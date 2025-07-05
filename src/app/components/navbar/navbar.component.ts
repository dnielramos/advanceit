import { NgClass, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faShoppingCart,
  faLanguage,
} from '@fortawesome/free-solid-svg-icons';
import { MobileMenuComponent } from './mobile-menu/mobile-menu.component';
import { TitleMegaMenuComponent } from '../../utils/title-mega-menu/title-mega-menu.component';
import { TrmComponent } from './trm/trm.component';
import { NavbarSectionsComponent } from './navbar-sections/navbar-sections.component';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ContextService } from '../../services/context.service';
import { filter } from 'rxjs/operators';

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
    TranslatePipe
  ],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent{
  faGlobe = faLanguage;
  // faUser = faUser;
  // faHome = faHome;
  faShoppingCart = faShoppingCart;
  textIdiom = 'es';
  idiom = 'English'

  constructor(private translate: TranslateService, private contextService: ContextService) {
    this.translate.addLangs(['es', 'en']);
    this.translate.setDefaultLang('es');
    this.translate.use('es');
  }

  cambiarIdioma() {
    this.textIdiom == 'es' ? (this.textIdiom = 'en') : (this.textIdiom = 'es');
    this.textIdiom == 'es' ? (this.idiom = 'English') : (this.idiom = 'Español');
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
}
