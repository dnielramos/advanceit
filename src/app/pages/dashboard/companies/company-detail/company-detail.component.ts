import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faArrowLeft, 
  faBuilding, 
  faMapMarkerAlt, 
  faIndustry, 
  faGlobe, 
  faMoneyBillWave, 
  faPercentage, 
  faCalendarAlt,
  faTruck
} from '@fortawesome/free-solid-svg-icons';
import { CompaniesService, Company } from '../../../../services/companies.service';
import { LocationMapComponent } from '../../../../components/dashboard/location-map/location-map.component';
import { SkeletonCardComponent } from '../../../../components/skeleton-card/skeleton-card.component';

@Component({
  selector: 'app-company-detail',
  standalone: true,
  imports: [
    CommonModule, 
    FontAwesomeModule, 
    LocationMapComponent, 
    SkeletonCardComponent
  ],
  templateUrl: './company-detail.component.html'
})
export class CompanyDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private companiesService = inject(CompaniesService);

  // Icons
  faArrowLeft = faArrowLeft;
  faBuilding = faBuilding;
  faMapMarkerAlt = faMapMarkerAlt;
  faIndustry = faIndustry;
  faGlobe = faGlobe;
  faMoneyBillWave = faMoneyBillWave;
  faPercentage = faPercentage;
  faCalendarAlt = faCalendarAlt;
  faTruck = faTruck;

  // State
  company = signal<Company | null>(null);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  mapAddress = signal<string>('');

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadCompany(id);
    } else {
      this.error.set('ID de empresa no válido');
      this.loading.set(false);
    }
  }

  loadCompany(id: string) {
    this.loading.set(true);
    this.companiesService.findById(id).subscribe({
      next: (data) => {
        this.company.set(data);
        // Construct address for map: "City, Country"
        // If address field existed, we would use it. For now, City + Country is the best approximation.
        const address = [data.ciudad, data.pais].filter(Boolean).join(', ');
        this.mapAddress.set(address);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading company:', err);
        this.error.set('No se pudo cargar la información de la empresa.');
        this.loading.set(false);
      }
    });
  }

  goBack() {
    this.router.navigate(['/dashboard/companies']);
  }
}
