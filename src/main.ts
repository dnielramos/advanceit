import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// const routes = [
//   { path: 'inicio', loadComponent: () => import('./app/pages/inicio/inicio.component').then(m => m.InicioComponent) },
//   { path: 'servicios', loadComponent: () => import('./app/pages/servicios/servicios.component').then(m => m.ServiciosComponent) },
//   { path: 'nosotros', loadComponent: () => import('./app/pages/nosotros/nosotros.component').then(m => m.NosotrosComponent) },
//   { path: 'alianzas', loadComponent: () => import('./app/pages/alianzas/alianzas.component').then(m => m.AlianzasComponent) },
//   { path: 'blog', loadComponent: () => import('./app/pages/blog/blog.component').then(m => m.BlogComponent) },
//   { path: 'productos', loadComponent: () => import('./app/pages/productos/productos.component').then(m => m.ProductosComponent) },
//   { path: 'contacto', loadComponent: () => import('./app/pages/contacto/contacto.component').then(m => m.ContactoComponent) },
//   { path: 'login', loadComponent: () => import('./app/pages/login/login.component').then(m => m.LoginComponent) },
//   { path: '', redirectTo: '/inicio', pathMatch: 'full' }
// ];

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
