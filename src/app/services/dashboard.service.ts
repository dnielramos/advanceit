import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// --- Interfaces para los datos CRUDOS que vienen de la API de NestJS ---
export interface ApiTimeSeriesData {
  period: string;
  total: number;
}

export interface ApiDistributionData {
  category: string;
  count: number;
}

export interface ApiProductPerformanceData {
  productName: string;
  totalRevenue: number;
}

export interface ApiSalesFunnelData {
  stage: string;
  count: number;
}

// --- Interfaz genérica para los datos que usarán las gráficas NGX-Charts ---
export interface ChartData {
  name: string;
  value: number;
}

export interface ChartLineData {
  name: string;
  series: ChartData[];
}


@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);

  // ❗️ IMPORTANTE: Reemplaza con la URL real de tu backend
  private apiUrl = 'https://advance-genai.onrender.com/dashboard';

  getRevenueOverTime(period: 'day' | 'week' | 'month' = 'day'): Observable<ApiTimeSeriesData[]> {
    return this.http.get<ApiTimeSeriesData[]>(`${this.apiUrl}/revenue-over-time`, { params: { period } });
  }

  getPaymentStatusDistribution(): Observable<ApiDistributionData[]> {
    return this.http.get<ApiDistributionData[]>(`${this.apiUrl}/payment-status`);
  }

  getTopProductsByRevenue(): Observable<ApiProductPerformanceData[]> {
    return this.http.get<ApiProductPerformanceData[]>(`${this.apiUrl}/top-products`);
  }

  getQuotationFunnel(): Observable<ApiSalesFunnelData[]> {
    return this.http.get<ApiSalesFunnelData[]>(`${this.apiUrl}/quotation-funnel`);
  }

  getShippingStatusDistribution(): Observable<ApiDistributionData[]> {
    return this.http.get<ApiDistributionData[]>(`${this.apiUrl}/shipping-status`);
  }
}
