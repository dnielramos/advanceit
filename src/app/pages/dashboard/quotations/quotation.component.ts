import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuotationService } from '../../../services/quotation.service';
import { QuotationListComponent } from './quotation-list/quotation-list.component';
import { QuotationDetailComponent } from '../quotations/quotation-detail/quotation-detail.component';
import { PopulatedQuotation, Quotation } from '../../../models/quotation.types';
import { HeaderCrudComponent } from '../../../shared/header-dashboard/heeader-crud.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-quotation',
  standalone: true,
  imports: [CommonModule, QuotationListComponent, HeaderCrudComponent],
  templateUrl: './quotation.component.html',
})
export class QuotationComponent {
  openEditModal($event: Event) {
    throw new Error('Method not implemented.');
  }
  openDetailsModal($event: Event) {
    throw new Error('Method not implemented.');
  }
  quotations = signal<PopulatedQuotation[]>([]);
  originalQuotations = signal<PopulatedQuotation[]>([]);
  selectedQuotation = signal<Quotation | PopulatedQuotation | null>(null);
  editingQuotation = signal<Quotation | PopulatedQuotation | null>(null);
  isLoading = signal(false);

  constructor(
    private quotationService: QuotationService,
    private router: Router
  ) {
    this.loadQuotations();
  }

  filterQuotations(filter: { texto: string; estado: string }) {
    this.isLoading.set(true);

    try {
      const filterText = filter.texto.toLowerCase().trim();
      const filterStatus = filter.estado.trim();

      const filteredQuotation = this.originalQuotations().filter((q) => {
        // Manejar valores nulos/undefined
        const name = q.created_by?.name?.toLowerCase() || '';
        const companyName = q.company?.razon_social?.toLowerCase() || '';
        const id = q.id?.toLowerCase() || '';
        const total = q.total?.toString() || '';
        const status = q.status || '';

        // Filtrar por texto (busca en múltiples campos)
        const matchesText =
          filterText === '' ||
          name.includes(filterText) ||
          companyName.includes(filterText) ||
          id.includes(filterText) ||
          total.includes(filterText);

        // Filtrar por estado (case-insensitive para consistencia)
        const matchesStatus =
          filterStatus === '' ||
          status.toLowerCase() === filterStatus.toLowerCase();

        return matchesText && matchesStatus;
      });

      this.quotations.set(filteredQuotation);
    } catch (error) {
      console.error('Error al filtrar cotizaciones:', error);
      // Mantener las cotizaciones originales en caso de error
      this.quotations.set(this.originalQuotations());
    } finally {
      this.isLoading.set(false);
    }
  }

  loadQuotations() {
    this.quotationService.findAllPopulated().subscribe((data) => {
      console.log('Quotaciones cargadas:', data);
      this.quotations.set(data);
      this.originalQuotations.set(data);
      this.isLoading.set(false);
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

  openCreateQuotation(): void {
    this.router.navigate(['/dashboard/advance-products']);
  }
}
