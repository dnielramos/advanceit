import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { LocationMapComponent } from '../../../../components/dashboard/location-map/location-map.component';
import {
  faArrowLeft,
  faBox,
  faBarcode,
  faCalendar,
  faBuilding,
  faMapMarkerAlt,
  faUser,
  faLaptop,
  faExternalLinkAlt,
  faInfoCircle,
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, LocationMapComponent],
  templateUrl: './product-detail.component.html',
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Icons
  faArrowLeft = faArrowLeft;
  faBox = faBox;
  faBarcode = faBarcode;
  faCalendar = faCalendar;
  faBuilding = faBuilding;
  faMapMarkerAlt = faMapMarkerAlt;
  faUser = faUser;
  faLaptop = faLaptop;
  faExternalLinkAlt = faExternalLinkAlt;
  faInfoCircle = faInfoCircle;

  // State
  productData = signal<any>(null);
  companyName = signal<string>('');
  columns = signal<string[]>([]);
  
  // Computed para obtener la dirección completa
  fullAddress = computed(() => {
    const product = this.productData();
    if (!product) return '';
    
    // Buscar todos los posibles campos de ubicación
    const city = product['City '] || product['City'] || product['Ciudad'] || '';
    const state = product['State'] || product['Estado'] || product['State '] || '';
    const country = product['Country'] || product['País'] || product['Country '] || '';
    const address = product['Address'] || product['Dirección'] || product['Address '] || '';
    const zipCode = product['Zip Code'] || product['Código Postal'] || product['Zip Code '] || '';
    
    // Construir dirección de manera inteligente
    const parts = [];
    
    if (address) parts.push(address);
    if (city) parts.push(city);
    if (state) parts.push(state);
    if (zipCode) parts.push(zipCode);
    if (country) parts.push(country);
    
    // Si no hay país pero hay ciudad, intentar con solo ciudad y estado
    const fullAddr = parts.filter(p => p).join(', ');
    
    return fullAddr || city || 'Ubicación no disponible';
  });
  
  showMap = signal<boolean>(false);

  ngOnInit(): void {
    // Obtener datos de la navegación
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state || history.state;

    if (state?.product) {
      this.productData.set(state.product);
      this.companyName.set(state.company || '');
      this.columns.set(state.columns || Object.keys(state.product));
      
      // Debug: mostrar todos los campos disponibles
      console.log('Campos del producto:', Object.keys(state.product));
      console.log('Dirección construida:', this.fullAddress());
    } else {
      // Si no hay datos, volver atrás
      this.goBack();
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard/inventory-uploader']);
  }

  openDellSupport(): void {
    window.open('https://www.dell.com/support/home/es-es', '_blank');
  }

  // Obtener valor de una columna
  getValue(col: string): any {
    return this.productData()?.[col] || 'N/A';
  }

  // Verificar si es columna importante
  isImportantColumn(col: string): boolean {
    const important = ['service tag', 'laptop model', 'serial', 'first name', 'last name', 'city'];
    return important.some(imp => col.toLowerCase().includes(imp));
  }
  
  // Toggle mapa
  toggleMap(): void {
    this.showMap.update(v => !v);
  }
  
  // Verificar si tiene ubicación
  hasLocation(): boolean {
    const addr = this.fullAddress();
    return addr !== '' && addr !== 'Ubicación no disponible';
  }
  
  // Obtener solo la ciudad para búsquedas más simples
  getCityOnly(): string {
    const product = this.productData();
    if (!product) return '';
    
    const city = product['City '] || product['City'] || product['Ciudad'] || '';
    const country = product['Country'] || product['País'] || product['Country '] || '';
    
    if (city && country) {
      return `${city}, ${country}`;
    }
    return city;
  }

  // Logo helpers
  private normalizeCompanyForLogo(name: string): string {
    return (name || '').toLowerCase().replace(/\s+/g, '');
  }

  getCompanyLogo(name: string): string {
    const base = `assets/logos/${this.normalizeCompanyForLogo(name)}`;
    return `${base}.png`;
  }

  onLogoError(event: Event, name: string): void {
    const img = event.target as HTMLImageElement;
    const base = `assets/logos/${this.normalizeCompanyForLogo(name)}`;
    if (img && (img as any).dataset && (img as any).dataset['fallback'] !== 'jpg') {
      img.src = `${base}.jpg`;
      (img as any).dataset['fallback'] = 'jpg';
    } else {
      img.src = 'logo.png';
    }
  }

  capitalizeCompany(name: string): string {
    if (!name) return '';
    const lower = name.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  }
}
