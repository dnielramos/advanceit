// ============================================
// location-map.component.ts
// ============================================
import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

interface Location {
  address: string;
  coords?: [number, number];
  displayName?: string;
  loading?: boolean;
  error?: boolean;
}

@Component({
  selector: 'app-location-map',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  template: `
    <div class="w-full h-full" [ngClass]="compact ? 'bg-white overflow-hidden' : 'bg-white rounded-2xl border border-gray-200 overflow-hidden'">
      <!-- Header - Solo en modo normal -->
      <div *ngIf="!compact" class="bg-white p-2">
        <div class="flex items-center gap-3">
          <i class="fas fa-map-marked-alt text-white text-2xl"></i>
          <h2 class="text-xl font-bold text-purple-600">Mapa de Ubicaciones</h2>
        </div>
        <p class="text-purple-500 text-sm mt-2 pl-3">
          {{ locations.length }} {{ locations.length === 1 ? 'ubicación' : 'ubicaciones' }} marcadas
        </p>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" [ngClass]="compact ? 'absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm z-[1000]' : 'p-8 text-center'">
        <div class="inline-flex items-center gap-3 text-purple-600" [ngClass]="compact ? 'flex-col' : ''">
          <i class="fas fa-spinner fa-spin" [ngClass]="compact ? 'text-3xl' : 'text-2xl'"></i>
          <span [ngClass]="compact ? 'text-sm' : 'text-lg'" class="font-medium">{{ compact ? 'Buscando ubicación...' : 'Buscando coordenadas...' }}</span>
        </div>
      </div>

      <!-- Map Container -->
      <div class="relative" [ngClass]="compact ? 'h-full' : ''">
        <div id="map-{{mapId}}" class="w-full bg-gray-100" [ngClass]="compact ? 'h-full' : 'h-[600px]'"></div>

        <!-- Map Overlay Info - Solo en modo normal -->
        <div *ngIf="!compact" class="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-gray-200 max-w-xs z-[1000]">
          <div class="flex items-center gap-2 text-gray-700 mb-2">
            <i class="fas fa-info-circle text-purple-600"></i>
            <span class="font-semibold text-sm">Controles</span>
          </div>
          <ul class="text-xs text-gray-600 space-y-1">
            <li><i class="fas fa-mouse text-purple-500 w-4"></i> Click en tarjetas para navegar</li>
            <li><i class="fas fa-search-plus text-purple-500 w-4"></i> Zoom con scroll o controles</li>
            <li><i class="fas fa-hand-pointer text-purple-500 w-4"></i> Arrastra para mover el mapa</li>
          </ul>
        </div>
      </div>

      <!-- Error Messages -->
      <div *ngIf="errors.length > 0" [ngClass]="compact ? 'absolute bottom-0 left-0 right-0 p-2 bg-red-50/95 backdrop-blur-sm border-t border-red-200 z-[1000]' : 'p-4 bg-red-50 border-t border-red-100'">
        <div class="flex items-start gap-3" [ngClass]="compact ? 'items-center' : ''">
          <i class="fas" [ngClass]="compact ? 'fa-exclamation-circle text-red-500' : 'fa-exclamation-triangle text-red-500 mt-1'"></i>
          <div class="flex-1" [ngClass]="compact ? '' : ''">
            <h4 *ngIf="!compact" class="font-semibold text-red-800 mb-1">No se pudieron geocodificar:</h4>
            <span *ngIf="compact" class="font-medium text-xs text-red-700">No se pudo encontrar la ubicación</span>
            <ul *ngIf="!compact" class="text-sm text-red-700 space-y-1">
              <li *ngFor="let error of errors" class="flex items-center gap-2">
                <i class="fas fa-times-circle text-xs"></i>
                {{ error }}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Locations Grid - Solo en modo normal -->
      <div *ngIf="!compact" class="p-6 bg-gray-50">
        <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <i class="fas fa-list text-purple-600"></i>
          Ubicaciones
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto pr-2">
          <div
            *ngFor="let location of locations; let i = index"
            (click)="focusLocation(i)"
            class="bg-white border-2 border-gray-200 rounded-xl p-4 cursor-pointer transition-all duration-300 hover:border-purple-400 hover:shadow-lg hover:-translate-y-1 group"
            [class.border-purple-500]="location.coords"
            [class.border-gray-300]="!location.coords"
          >
            <div class="flex items-start gap-3">
              <div class="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform">
                <i class="fas" [class]="location.loading ? 'fa-spinner fa-spin' : location.error ? 'fa-exclamation' : 'fa-map-marker-alt'"></i>
              </div>

              <div class="flex-1 min-w-0">
                <h4 class="font-semibold text-gray-800 truncate group-hover:text-purple-600 transition-colors">
                  {{ location.address }}
                </h4>

                <div class="mt-1">
                  <span
                    *ngIf="location.loading"
                    class="text-xs text-gray-500 flex items-center gap-1"
                  >
                    <i class="fas fa-circle-notch fa-spin"></i>
                    Buscando...
                  </span>

                  <span
                    *ngIf="location.error"
                    class="text-xs text-red-500 flex items-center gap-1"
                  >
                    <i class="fas fa-times-circle"></i>
                    No encontrado
                  </span>

                  <span
                    *ngIf="location.coords && !location.loading"
                    class="text-xs text-purple-600 flex items-center gap-1"
                  >
                    <i class="fas fa-check-circle"></i>
                    Ubicado
                  </span>
                </div>

                <p *ngIf="location.displayName" class="text-xs text-gray-500 mt-2 line-clamp-2">
                  {{ location.displayName }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="locations.length === 0 && !isLoading" class="text-center py-12">
          <i class="fas fa-map-marked text-gray-300 text-5xl mb-4"></i>
          <p class="text-gray-500 font-medium">No hay ubicaciones para mostrar</p>
          <p class="text-gray-400 text-sm mt-2">Pasa direcciones al componente para comenzar</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
    }

    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    /* Custom scrollbar */
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    ::-webkit-scrollbar-track {
      background: #f3f4f6;
      border-radius: 4px;
    }

    ::-webkit-scrollbar-thumb {
      background: #a78bfa;
      border-radius: 4px;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: #8b5cf6;
    }
  `]
})
export class LocationMapComponent implements OnInit, OnChanges {
  @Input({required: true}) address: string | string[] = [];
  @Input() compact: boolean = false; // Modo compacto para vistas pequeñas

  locations: Location[] = [];
  errors: string[] = [];
  isLoading = false;
  mapId = Math.random().toString(36).substr(2, 9); // Sin prefijo "map-" porque se agrega en el template

  private map: any;
  private markers: any[] = [];
  private L: any;

  constructor(private http: HttpClient) {}

  async ngOnInit() {
    console.log('LocationMap ngOnInit - compact mode:', this.compact);
    console.log('LocationMap address:', this.address);
    console.log('LocationMap mapId:', this.mapId);
    
    await this.loadLeaflet();
    
    // En modo compacto, esperar un poco más para que el DOM esté listo
    if (this.compact) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    this.initMap();
    await this.processAddresses();
  }

  async ngOnChanges(changes: SimpleChanges) {
    if (changes['address'] && !changes['address'].firstChange) {
      await this.processAddresses();
    }
  }

  private async loadLeaflet() {
    if (typeof window !== 'undefined' && !(window as any).L) {
      // Load Leaflet CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      // Load Leaflet JS
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';

      await new Promise((resolve) => {
        script.onload = resolve;
        document.head.appendChild(script);
      });
    }
    this.L = (window as any).L;
  }

  private initMap() {
    if (!this.L) {
      console.error('Leaflet library not loaded');
      return;
    }
    
    if (this.map) {
      console.log('Map already initialized');
      return;
    }

    setTimeout(() => {
      const mapElement = document.getElementById(`map-${this.mapId}`);
      console.log('Attempting to initialize map with id:', `map-${this.mapId}`);
      console.log('Map element found:', !!mapElement);
      
      if (!mapElement) {
        console.error('Map element not found:', `map-${this.mapId}`);
        console.log('Available elements:', document.querySelectorAll('[id^="map-"]'));
        return;
      }

      console.log('Map element dimensions:', {
        width: mapElement.offsetWidth,
        height: mapElement.offsetHeight
      });

      try {
        this.map = this.L.map(`map-${this.mapId}`, {
          center: [20, -10],
          zoom: 2,
          scrollWheelZoom: true,
          dragging: true
        });

        this.L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
          attribution: '',
          maxZoom: 19
        }).addTo(this.map);

        // Apply purple tint
        if (mapElement) {
          mapElement.style.filter = 'hue-rotate(280deg) saturate(0.8)';
        }

        console.log('Map initialized successfully');

        // Forzar redimensionamiento del mapa después de inicializar
        setTimeout(() => {
          if (this.map) {
            this.map.invalidateSize();
            console.log('Map invalidateSize called');
          }
        }, 300);
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    }, this.compact ? 500 : 100);
  }

  private async processAddresses() {
    this.isLoading = true;
    this.locations = [];
    this.errors = [];
    this.clearMarkers();

    const addresses = Array.isArray(this.address) ? this.address : [this.address];

    if (addresses.length === 0 || (addresses.length === 1 && !addresses[0])) {
      this.isLoading = false;
      return;
    }

    for (const addr of addresses) {
      if (!addr || !addr.trim()) continue;

      const location: Location = {
        address: addr.trim(),
        loading: true
      };
      this.locations.push(location);

      try {
        const result = await this.geocodeAddress(addr.trim());

        if (result) {
          location.coords = result.coords;
          location.displayName = result.displayName;
          location.loading = false;
          this.addMarker(location);
        } else {
          location.error = true;
          location.loading = false;
          this.errors.push(addr.trim());
        }
      } catch (error) {
        location.error = true;
        location.loading = false;
        this.errors.push(addr.trim());
      }

      // Delay to avoid API rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    this.isLoading = false;
    this.fitMapBounds();
  }

  private async geocodeAddress(address: string): Promise<{coords: [number, number], displayName: string} | null> {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;

    try {
      const data: any = await firstValueFrom(this.http.get(url));

      if (data && data.length > 0) {
        return {
          coords: [parseFloat(data[0].lat), parseFloat(data[0].lon)],
          displayName: data[0].display_name
        };
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }

  private addMarker(location: Location) {
    if (!this.map || !location.coords || !this.L) return;

    const purpleIcon = this.L.divIcon({
      className: 'custom-marker',
      html: `<div style="
        width: 32px;
        height: 32px;
        background: linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%);
        border: 3px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 4px 12px rgba(124, 58, 237, 0.4);
      "></div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });

    const marker = this.L.marker(location.coords, { icon: purpleIcon })
      .addTo(this.map)
      .bindPopup(`
        <div style="font-family: system-ui; padding: 8px;">
          <div style="font-weight: 600; color: #4c1d95; margin-bottom: 4px;">
            ${location.address}
          </div>
          <div style="font-size: 12px; color: #6b7280;">
            ${location.displayName || ''}
          </div>
        </div>
      `);

    this.markers.push(marker);
  }

  focusLocation(index: number) {
    const location = this.locations[index];
    if (location.coords && this.map && this.markers[index]) {
      this.map.setView(location.coords, 13, {
        animate: true,
        duration: 1
      });
      this.markers[index].openPopup();
    }
  }

  private clearMarkers() {
    this.markers.forEach(marker => {
      if (this.map) {
        this.map.removeLayer(marker);
      }
    });
    this.markers = [];
  }

  private fitMapBounds() {
    if (!this.map || !this.L || this.markers.length === 0) return;

    setTimeout(() => {
      if (this.markers.length === 1) {
        // Para una sola ubicación, centrar con zoom apropiado
        const marker = this.markers[0];
        const latLng = marker.getLatLng();
        this.map.setView(latLng, 13); // Zoom 13 es bueno para ciudades
      } else {
        // Para múltiples ubicaciones, ajustar bounds
        const group = this.L.featureGroup(this.markers);
        this.map.fitBounds(group.getBounds(), { padding: [50, 50] });
      }
    }, 500);
  }
}
