import { Routes } from '@angular/router';
import { LandingLayoutComponent } from '../layout/landing-layout/landing-layout.component';
import { CartComponent } from '../components/cart/cart.component';

export const landingRoutes = [
  {
    path: '',
    loadComponent: () => LandingLayoutComponent,
    children: [
      { path: '', loadComponent: () => import('../pages/inicio/inicio.component').then(m => m.InicioComponent) },


      { path: 'hardware-provisioning', loadComponent: () => import('../components/inicio/hardware-provisioning/hardware-provisioning.component').then(m => m.HardwareProvisioningComponent) },
      { path: 'software-as-a-service', loadComponent: () => import('../components/inicio/software-service/software-service.component').then(m => m.SoftwareServiceComponent) },
      { path: 'cloud-cibersecurity', loadComponent: () => import('../components/inicio/cloud-cibersecurity/cloud-cibersecurity.component').then(m => m.CloudCibersecurityComponent) },
      { path: 'helpdesk-support', loadComponent: () => import('../components/inicio/helpdesk-support/helpdesk-support.component').then(m => m.HelpdeskSupportComponent) },
      { path: 'enterprise-technologies', loadComponent: () => import('../components/inicio/enterprise-tech/enterprise-tech.component').then(m => m.EnterpriseTechComponent) },

      // { path: 'global-forwarding', loadComponent: () => import('../pages/solutions/forward/forward.component').then(m => m.ForwardComponent) },
      // { path: 'warehousing-distribution', loadComponent: () => import('../pages/solutions/warehousing/warehousing.component').then(m => m.WarehousingComponent) },
      // { path: 'back-office', loadComponent: () => import('../pages/solutions/back-office/back-office.component').then(m => m.BackOfficeComponent) },
      // { path: 'software-development', loadComponent: () => import('../pages/solutions/software/software.component').then(m => m.SoftwareComponent) },
      // { path: 'heldesk-service', loadComponent: () => import('../pages/solutions/helpdesk/helpdesk.component').then(m => m.HelpdeskComponent) },
      // { path: 'business-intelligence', loadComponent: () => import('../pages/solutions/bussines/bussines.component').then(m => m.BussinesComponent) },
      // { path: 'data-science', loadComponent: () => import('../pages/solutions/datascience/datascience.component').then(m => m.DatascienceComponent) },
      // { path: 'customer-support', loadComponent: () => import('../pages/solutions/customer-support/customer-support.component').then(m => m.CustomerSupportComponent) },
      // { path: 'professional-services', loadComponent: () => import('../pages/solutions/professional-services/professional-services.component').then(m => m.ProfessionalServicesComponent) },
      // { path: 'recruitment', loadComponent: () => import('../pages/solutions/recruitment/recruitment.component').then(m => m.RecruitmentComponent) },
      // { path: 'creative-professionals', loadComponent: () => import('../pages/solutions/creative-professional/creative-professional.component').then(m => m.CreativeProfessionalComponent) },
      // { path: 'sales', loadComponent: () => import('../pages/solutions/sales/sales.component').then(m => m.SalesComponent) },
      // { path: 'carrier-sales', loadComponent: () => import('../pages/solutions/carrier-sales/carrier-sales.component').then(m => m.CarrierSalesComponent) },
      // { path: 'asset-disposal', loadComponent: () => import('../pages/solutions/asset-disposal/asset-disposal.component').then(m => m.AssetDisposalComponent) },
      // { path: 'procurement-logictics', loadComponent: () => import('../pages/solutions/procurement-logistics/procurement-logistics.component').then(m => m.ProcurementLogisticsComponent) },
      // { path: 'licence-optimization', loadComponent: () => import('../pages/solutions/licence-optimization/licence-optimization.component').then(m => m.LicenceOptimizationComponent) },
      // { path: 'identity-access', loadComponent: () => import('../pages/solutions/identity-access/identity-access.component').then(m => m.IdentityAccessComponent) },
      // { path: 'powered-assistance', loadComponent: () => import('../pages/solutions/powered-assistance/powered-assistance.component').then(m => m.PoweredAssistanceComponent) },
      // { path: 'service-flow', loadComponent: () => import('../pages/solutions/service-flow/service-flow.component').then(m => m.ServiceFlowComponent) },
      // { path: 'data-center', loadComponent: () => import('../pages/solutions/data-center/data-center.component').then(m => m.DataCenterComponent) },
      // { path: 'relocation-expansion', loadComponent: () => import('../pages/solutions/relocation-expansion/relocation-expansion.component').then(m => m.RelocationExpansionComponent) },

      { path: 'healthcare', loadComponent: () => import('../pages/industries/retail/retail.component').then(m => m.RetailComponent) },
      { path: 'insurance', loadComponent: () => import('../pages/industries/insurance/insurance.component').then(m => m.InsuranceComponent) },
      { path: 'financial-services', loadComponent: () => import('../pages/industries/financial-services/financial-services.component').then(m => m.FinancialServicesComponent) },
      { path: 'Logistics-supply-chain', loadComponent: () => import('../pages/industries/manufacturing/manufacturing.component').then(m => m.ManufacturingComponent) },
      { path: 'other-industries', loadComponent: () => import('../pages/industries/other-industries/other-industries.component').then(m => m.OtherIndustriesComponent) },

      { path: 'case-studies', loadComponent: () => import('../pages/resourses/case-studies/case-studies.component').then(m => m.CaseStudiesComponent) },
      { path: 'partners', loadComponent: () => import('../pages/resourses/partners/partners.component').then(m => m.PartnersComponent) },
      { path: 'faq', loadComponent: () => import('../pages/resourses/faq/faq.component').then(m => m.FaqComponent) },


      { path: 'white-papers', loadComponent: () => import('../pages/resourses/white-papers/white-papers.component').then(m => m.WhitepaperComponent) },
      {path : 'wp-stanley', loadComponent: () => import('../pages/resourses/white-papers/wp-stanley/wp-stanley.component').then(m => m.WpStanleyComponent) },
      {path : 'wp-biogen', loadComponent: () => import('../pages/resourses/white-papers/wp-biogen/wp-biogen.component').then(m => m.WpBiogenComponent) },
      {path : 'wp-stonex', loadComponent: () => import('../pages/resourses/white-papers/wp-stonex/wp-stonex.component').then(m => m.WpStonexComponent) },


       { path: 'productos/cart', loadComponent: () => import('../components/cart/cart.component').then(m => m.CartComponent) },
       { path: 'productos/chat', loadComponent: () => import('../pages/luki/luki.component').then(m => m.LukiComponent) },
       { path: 'productos/:category', loadComponent: () => import('../pages/productos/buscar-productos-categorias/buscar-productos-categorias.component').then(m => m.BuscarProductosCategoriasComponent) },

      { path: 'nuestra-historia', loadComponent: () => import('../pages/nosotros/ourhistory/ourhistory.component').then(m => m.OurhistoryComponent) },
      { path: 'impacto-social', loadComponent: () => import('../pages/nosotros/impacto-social/impacto-social.component').then(m => m.ImpactoSocialComponent) },
      { path: 'terms-and-conditions', loadComponent: () => import('../pages/alianzas/alianzas.component').then(m => m.AlianzasComponent) },
      { path: 'productos', loadComponent: () => import('../pages/productos/productos.component').then(m => m.ProductosComponent) },
      { path: 'contacto', loadComponent: () => import('../pages/contacto/contacto.component').then(m => m.ContactoComponent) },
      { path: 'in', loadComponent: () => import('../pages/login/login.component').then(m => m.LoginComponent) },
    ]
  }
];
