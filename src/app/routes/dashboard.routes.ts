import { Routes } from '@angular/router';
import { authGuard } from '../security/auth.guard';

export const dashboardRoutes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('../layout/dashboard-layout/dashboard-layout.component').then(
        (m) => m.DashboardLayoutComponent
      ),
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('../pages/luki/luki.component').then((m) => m.LukiComponent),
      },
      {
        path: 'add-ingram-products',
        loadComponent: () =>
          import('../pages/dashboard/add-products/add-products.component').then(
            (m) => m.AddProductsComponent
          ),
      },
      {
        path: 'add-nexsys-products',
        loadComponent: () =>
          import('../components/dashboard/nexsys/nexsys.component').then(
            (m) => m.NexsysComponent
          ),
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('../pages/dashboard/orders/orders.component').then(
            (m) => m.OrdersComponent
          ),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('../pages/dashboard/users/user-list.component').then(
            (m) => m.UserListComponent
          ),
      },
      {
        path: 'companies',
        loadComponent: () =>
          import('../pages/dashboard/companies/company.component').then(
            (m) => m.CompanyComponent
          ),
      },
      {
        path: 'shippings',
        loadComponent: () =>
          import('../components/dashboard/shippings-manager/shippings-manager.component').then(
            (m) => m.ShippingsManagerComponent
          ),
      },
      {
        path: 'cotizaciones',
        loadComponent: () =>
          import('../pages/dashboard/quotations/quotation.component').then(
            (m) => m.QuotationComponent
          ),
      },
      {
        path: 'cotizaciones/crear-cotizacion',
        loadComponent: () =>
          import('../pages/dashboard/quotations/quotation-create/quotation-create.component').then(
            (m) => m.QuotationCreateComponent
          ),
      },

      {
        path: 'advance-products',
        loadComponent: () =>
          import(
            '../pages/dashboard/advance-products/advance-products.component'
          ).then((m) => m.AdvanceProductsComponent),
      },
      
      { path: 'cart', loadComponent: () => import('../components/cart/cart.component').then(m => m.CartComponent) },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
    ],
  },
];
