import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { ContextService } from './services/context.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'advance-tech-project';

  showNav = false;

  constructor(private contextService: ContextService, private router: Router) {}

  ngOnInit(): void {
    // 1. Comprobación inicial al cargar
    const currentUrl = this.router.url;
    const isProductPage =
      currentUrl.startsWith('/productos') || currentUrl.startsWith('/in');
    this.contextService.setNavVisibility(!isProductPage);

    // Escucha cambios de ruta
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const currentUrl = event.urlAfterRedirects;

        // Si la ruta es /productos, ocultar el navbar
        const isProductPageOrLogin =
          currentUrl.startsWith('/productos') || currentUrl.startsWith('/in');
        this.contextService.setNavVisibility(!isProductPageOrLogin);
      });

    // Suscribirse al observable de visibilidad
    this.contextService.nav$.subscribe((value) => {
      this.showNav = value;
    });
  }
}
