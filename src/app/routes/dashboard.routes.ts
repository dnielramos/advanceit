import { Routes } from '@angular/router';

export const dashboardRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('../layout/dashboard-layout/dashboard-layout.component').then(m => m.DashboardLayoutComponent),
    children: [
      {
        path: 'home',
        loadComponent: () => import('../pages/luki/luki.component').then(m => m.LukiComponent)
      },
      {
        path: 'add-ingram-products',
        loadComponent: () => import('../pages/dashboard/add-products/add-products.component').then(m => m.AddProductsComponent)
      },
      {
        path: 'add-nexsys-products',
        loadComponent: () => import('../components/dashboard/nexsys/nexsys.component').then(m => m.NexsysComponent)
      },
      {
        path: 'orders',
        loadComponent: () => import('../pages/dashboard/orders/orders.component').then(m => m.OrdersComponent)
      },
      {
        path: 'advance-products',
        loadComponent: () => import('../pages/dashboard/advance-products/advance-products.component').then(m => m.AdvanceProductsComponent)
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      }
    ]
  }
];
