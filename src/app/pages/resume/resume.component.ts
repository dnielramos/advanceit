import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { obtenerSaludo } from '../..//utils/morning'


// Dependencias de terceros
import { NgxChartsModule, Color, ScaleType } from '@swimlane/ngx-charts';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChartLine, faChartPie, faBoxesStacked, faFilterCircleDollar, faTruckFast } from '@fortawesome/free-solid-svg-icons';

// Servicio e Interfaces
import { DashboardService, ChartData, ChartLineData, ApiDistributionData, ApiProductPerformanceData, ApiSalesFunnelData, ApiTimeSeriesData } from '../../services/dashboard.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-resume',
  standalone: true,
  imports: [
    CommonModule,
    NgxChartsModule,
    FontAwesomeModule
  ],
  // No es necesario proveer el servicio aquí si ya está en 'root'
  templateUrl: './resume.component.html',
})
export class ResumeComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private authService = inject(AuthService);

  // Iconos de Font Awesome
  icons = { faChartLine, faChartPie, faBoxesStacked, faFilterCircleDollar, faTruckFast };

  // Observables para los datos ya transformados para las gráficas
  revenueOverTime$!: Observable<ChartLineData[]>;
  paymentStatus$!: Observable<ChartData[]>;
  topProducts$!: Observable<ChartData[]>;
  quotationFunnel$!: Observable<ChartData[]>;
  shippingStatus$!: Observable<ChartData[]>;

  selectedPeriod: 'day' | 'week' | 'month' = 'day';

  userName: string = 'Desconocido';
  userGreeting: string = this.userName + ', ';

  // Esquema de colores usando los valores hexadecimales de la paleta de Tailwind
  colorScheme: Color = {
    name: 'cool',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#8B5CF6', '#6366F1', '#A78BFA', '#7C3AED', '#DDD6FE'],
  };

  // Formateador para ejes de moneda
  yAxisTickFormatting = (val: number): string => `$${val.toLocaleString()}`;

  ngOnInit(): void {

    this.loadAllData();
  }

  loadAllData(): void {
    this.loadRevenueData();

    this.paymentStatus$ = this.dashboardService.getPaymentStatusDistribution().pipe(
      map((apiData: ApiDistributionData[]) =>
        apiData.map(item => ({ name: item.category, value: item.count }))
      )
    );

    this.topProducts$ = this.dashboardService.getTopProductsByRevenue().pipe(
      map((apiData: ApiProductPerformanceData[]) =>
        apiData.map(item => ({ name: item.productName, value: item.totalRevenue }))
      )
    );

    this.quotationFunnel$ = this.dashboardService.getQuotationFunnel().pipe(
      map((apiData: ApiSalesFunnelData[]) =>
        apiData.map(item => ({ name: item.stage.substring(3), value: item.count })) // Quita el "1. ", "2. ", etc.
      )
    );

    this.shippingStatus$ = this.dashboardService.getShippingStatusDistribution().pipe(
      map((apiData: ApiDistributionData[]) =>
        apiData.map(item => ({ name: item.category, value: item.count }))
      )
    );


    // Suscribirse al observable del nombre del usuario activo
    this.authService.activeUser$.subscribe(name => {
      this.userName = name || 'Desconocido';
      this.userGreeting = this.userName + ', ' + obtenerSaludo();

    });
  }

  loadRevenueData(): void {
    this.revenueOverTime$ = this.dashboardService.getRevenueOverTime(this.selectedPeriod).pipe(
      map((apiData: ApiTimeSeriesData[]) => [
        {
          name: 'Ingresos',
          series: apiData.map(item => ({ name: item.period, value: item.total })) // <-- SOLUCIONADO
        }
      ])
    );
  }

  selectPeriod(period: 'day' | 'week' | 'month'): void {
    if (this.selectedPeriod === period) return;
    this.selectedPeriod = period;
    this.loadRevenueData();
  }
}
