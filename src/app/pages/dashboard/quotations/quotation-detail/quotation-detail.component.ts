import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { QuotationService } from '../../../../services/quotation.service';
import { PopulatedQuotation, Quotation, QuotationStatus } from '../../../../models/quotation.types';
import { faSpinner, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CompaniesService } from '../../../../services/companies.service';
import { UsersService } from '../../../../services/users.service';
import { forkJoin } from 'rxjs';

library.add(faSpinner, faExclamationCircle);

@Component({
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  selector: 'app-quotation-detail',
  templateUrl: './quotation-detail.component.html',
})
export class QuotationDetailComponent implements OnInit {
  @Input() quotationId: string | null = null;
  quotation: any = null;
  company: any = null;
  user: any = null;
  isLoading = true;
  error: string | null = null;
  
  // Icons
  faSpinner = faSpinner;
  faExclamationCircle = faExclamationCircle;
  
  // Today's date in Spanish
  today = new Date().toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  constructor(
    private quotationService: QuotationService,
    private companiesService: CompaniesService,
    private usersService: UsersService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Try to get ID from route params first, then fall back to @Input
    const routeId = this.route.snapshot.paramMap.get('id');
    const idToUse = routeId || this.quotationId;
    
    if (idToUse) {
      this.loadQuotationDetails(idToUse);
    }
  }

  loadQuotationDetails(id: string): void {
    this.isLoading = true;
    this.error = null;
    this.quotationService.findOne(id).subscribe({
      next: (data) => {
        console.log('Quotation data received:', data);
        this.quotation = data;
        
        // Load company and user data if we only have IDs
        if (data.company_id && !data.company) {
          this.loadCompanyAndUser(data.company_id, data.user_id);
        } else {
          // Data already populated
          this.company = data.company;
          this.user = data.user;
          this.isLoading = false;
        }
      },
      error: (err) => {
        this.error = 'No se pudo cargar la cotización. Inténtelo de nuevo más tarde.';
        console.error('Error fetching quotation details:', err);
        this.isLoading = false;
      }
    });
  }

  loadCompanyAndUser(companyId: string, userId: string): void {
    forkJoin({
      companies: this.companiesService.findAll(),
      users: this.usersService.getUsers()
    }).subscribe({
      next: (result) => {
        this.company = result.companies.find((c: any) => c.id == companyId);
        this.user = result.users.find((u: any) => u.id === userId);
        console.log('Company loaded:', this.company);
        console.log('User loaded:', this.user);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading company/user:', err);
        this.isLoading = false;
      }
    });
  }

  // Calculate total from details
  get totalQuotation(): number {
    if (!this.quotation || !this.quotation.details) {
      return 0;
    }
    return this.quotation.details.reduce((sum: number, detail: any) => {
      return sum + (detail.quantity * detail.unit_price);
    }, 0);
  }

  getStatusColor(status: any): string {
    switch (status) {
      case QuotationStatus.DRAFT:
        return 'bg-gray-200 text-gray-700';
      case QuotationStatus.SENT:
        return 'bg-purple-200 text-purple-700';
      case QuotationStatus.APPROVED:
        return 'bg-green-200 text-green-700';
      case QuotationStatus.REJECTED:
        return 'bg-red-200 text-red-700';
      case QuotationStatus.EXPIRED:
        return 'bg-yellow-200 text-yellow-700';
      default:
        return 'bg-gray-200 text-gray-700';
    }
  }

  getStatusText(status: any): string {
    switch (status) {
      case QuotationStatus.DRAFT:
        return 'Borrador';
      case QuotationStatus.SENT:
        return 'Enviado';
      case QuotationStatus.APPROVED:
        return 'Aprobado';
      case QuotationStatus.REJECTED:
        return 'Rechazado';
      case QuotationStatus.EXPIRED:
        return 'Expirado';
      default:
        return 'Desconocido';
    }
  }
}
