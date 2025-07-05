import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from "../../components/navbar/navbar.component";
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { ContextService } from '../../services/context.service';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-landing-layout',
  imports: [NavbarComponent, RouterOutlet, CommonModule],
  templateUrl: './landing-layout.component.html',
})
export class LandingLayoutComponent implements OnInit {


  showNav = false;

  constructor(private contextService: ContextService, private router: Router) {}

   ngOnInit(): void {
     // 1. Comprobación inicial al cargar
    const currentUrl = this.router.url;
    const isProductPage = currentUrl.startsWith('/productos');
    this.contextService.setNavVisibility(!isProductPage);

    // Escucha cambios de ruta
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      const currentUrl = event.urlAfterRedirects;

      // Si la ruta es /productos, ocultar el navbar
      const isProductPage = currentUrl.startsWith('/productos');
      this.contextService.setNavVisibility(!isProductPage);
    });

    // Suscribirse al observable de visibilidad
    this.contextService.nav$.subscribe(value => {
      this.showNav = value;
    });
  }

}
