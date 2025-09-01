import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuotationService } from '../../../services/quotation.service';
import { QuotationListComponent } from './quotation-list.component';
import { QuotationDetailComponent } from './quotation-detail.component';
import { Quotation } from '../../../models/quotation.types';


@Component({
  selector: 'app-quotation',
  standalone: true,
  imports: [CommonModule, QuotationListComponent],
  templateUrl: './quotation.component.html'
})
export class QuotationComponent {
openEditModal($event: Event) {
throw new Error('Method not implemented.');
}
openDetailsModal($event: Event) {
throw new Error('Method not implemented.');
}
  quotations = signal<Quotation[]>([]);
  selectedQuotation = signal<Quotation | null>(null);
  editingQuotation = signal<Quotation | null>(null);

  constructor(private quotationService: QuotationService) {
    this.loadQuotations();
  }

  loadQuotations() {
    this.quotationService.findAll().subscribe((data) => {
      console.log('Quotaciones cargadas:', data);
      this.quotations.set(data);
    });
  }

  viewQuotation(q: Quotation) {
    this.selectedQuotation.set(q);
  }

  editQuotation(q: Quotation) {
    if (this.editingQuotation()) return; // Evita abrir múltiples ediciones
    this.editingQuotation.set(q);
  }

  closeModal() {
    this.selectedQuotation.set(null);
    this.editingQuotation.set(null);
  }
}
