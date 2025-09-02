import { Component, OnInit, Input } from '@angular/core';
import { QuotationService } from '../../../../services/quotation.service';
import { Quotation, QuotationStatus } from '../../../../models/quotation.types';
import { faSpinner, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
import { CommonModule } from '@angular/common';

library.add(faSpinner, faExclamationCircle);

@Component({
  imports: [CommonModule],
  selector: 'app-quotation-detail',
  templateUrl: './quotation-detail.component.html',
})
export class QuotationDetailComponent implements OnInit {
  @Input() quotationId: string | null = null;
  quotation: (Quotation & { details: any[] }) | null = null;
  isLoading = true;
  error: string | null = null;

  constructor(private quotationService: QuotationService) {}

  ngOnInit(): void {
    if (this.quotationId) {
      this.loadQuotationDetails();
    }
  }

  loadQuotationDetails(): void {
    this.isLoading = true;
    this.error = null;
    this.quotationService.findOne(this.quotationId!).subscribe({
      next: (data) => {
        this.quotation = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'No se pudo cargar la cotización. Inténtelo de nuevo más tarde.';
        console.error('Error fetching quotation details:', err);
        this.isLoading = false;
      }
    });
  }

  getStatusColor(status: any): string {
    // ... (misma lógica que en quotation-list.component.ts) ...
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
    // ... (misma lógica que en quotation-list.component.ts) ...
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
