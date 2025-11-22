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
          import('../pages/resume/resume.component').then((m) => m.ResumeComponent),
      },
      {
        path: 'lunai',
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
        path: 'ordenes/:id',
        loadComponent: () =>
          import('../pages/dashboard/orders/order-detail/order-detail.component').then(
            (m) => m.OrderDetailComponent
          ),
      },
      {
        path: 'inventory-uploader',
        loadComponent: () =>
          import('../components/dashboard/inventory-uploader/inventory-uploader.component').then(
            (m) => m.InventoryUploaderComponent
          ),
      },

      {
        path: 'orders/procesar-orden',
        loadComponent: () =>
          import('../pages/dashboard/orders/create-order-modal/create-order-modal.component').then(
            (m) => m.CreateOrderModalComponent
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
        path: 'payments',
        loadComponent: () =>
          import('../components/dashboard/payments-manager/payments-manager.component').then(
            (m) => m.PaymentsManagerComponent
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
        path: 'solicitudes',
        loadComponent: () =>
          import('../components/dashboard/rmas-manager/rmas-manager.component').then(
            (m) => m.RmaManagerComponent
          ),
      },
      {
        path: 'solicitudes/nueva',
        loadComponent: () =>
          import('../pages/dashboard/rmas/create-rma/create-rma.component').then(
            (m) => m.CreateRmaComponent
          ),
      },
      {
        path: 'solicitudes/:id',
        loadComponent: () =>
          import('../pages/dashboard/rmas/rma-detail/rma-detail.component').then(
            (m) => m.RmaDetailComponent
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
          import('../pages/dashboard/quotations/quotation-create-user/quotation-create-user.component').then(
            (m) => m.QuotationCreateUserComponent
          ),
      },


      {
        path: 'advance-products',
        loadComponent: () =>
          import(
            '../pages/filter-products/filter-products.component'
          ).then((m) => m.FilterProductsComponent),
      },
      {
        path: 'inventory-uploader/product/:id',
        loadComponent: () =>
          import('../pages/dashboard/inventory/product-detail/product-detail.component').then(
            (m) => m.ProductDetailComponent
          ),
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
