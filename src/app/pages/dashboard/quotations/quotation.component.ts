import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Quotation, QuotationService } from '../../../services/quotation.service';
import { QuotationListComponent } from './quotation-list.component';
import { QuotationDetailComponent } from './quotation-detail.component';
import { QuotationEditComponent } from './quotation-edit.component';


@Component({
  selector: 'app-quotation',
  standalone: true,
  imports: [CommonModule, QuotationListComponent, QuotationDetailComponent, QuotationEditComponent],
  templateUrl: './quotation.component.html'
})
export class QuotationComponent {
  quotations = signal<Quotation[]>([]);
  selectedQuotation = signal<Quotation | null>(null);
  editingQuotation = signal<Quotation | null>(null);

  constructor(private quotationService: QuotationService) {
    this.loadQuotations();
  }

  loadQuotations() {
    this.quotationService.getAll().subscribe((data) => {
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
