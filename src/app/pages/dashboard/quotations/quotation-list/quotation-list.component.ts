import { Component, OnInit } from '@angular/core';
import { QuotationService } from '../../../../services/quotation.service';
import { Quotation, QuotationStatus } from '../../../../models/quotation.types';
import { faPlus, faFileInvoice, faEye, faEdit, faCheckCircle, faTrashAlt, faTimes, faUser, faDollarSign, faCalendarAlt, faBoxOpen } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
import { QuotationFormComponent } from '../quotation-form/quotation-form.component';
import { QuotationDetailComponent } from '../../quotations/quotation-detail/quotation-detail.component';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { QuotationCreateComponent } from '../quotation-create/quotation-create.component';
import { Validators } from '@angular/forms';


@Component({
  imports: [QuotationFormComponent, QuotationDetailComponent, QuotationCreateComponent, CommonModule, FontAwesomeModule],
  selector: 'app-quotation-list',
  templateUrl: './quotation-list.component.html',
})
export class QuotationListComponent implements OnInit {
confirmDeletion(arg0: any) {
throw new Error('Method not implemented.');
}
openStatusModal(arg0: any) {
throw new Error('Method not implemented.');
}
  quotations: Quotation[] = [];
  isLoading = true;
  isModalOpen = false;
  currentModal: 'create' | 'edit' | 'details' | 'status' | null = null;
  selectedQuotationId: string | null = null;
  modalTitle = '';

  //icons

  faPlus = faPlus;
  faFileInvoice = faFileInvoice;
  faEye = faEye;
  faEdit = faEdit;
  faCheckCircle = faCheckCircle;
  faTrashAlt = faTrashAlt;
  faTimes = faTimes;
  faUser = faUser;
  faDollarSign = faDollarSign;
  faCalendarAlt = faCalendarAlt;
  faBoxOpen = faBoxOpen;

  constructor(private quotationService: QuotationService) {}

  ngOnInit(): void {
    this.fetchQuotations();
  }

  fetchQuotations(): void {
    this.isLoading = true;
    this.quotationService.findAll().subscribe({
      next: (data) => {
        this.quotations = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching quotations:', err);
        this.isLoading = false;
      }
    });
  }

  openCreateModal(): void {
    this.currentModal = 'create';
    this.modalTitle = 'Crear Nueva Cotización';
    this.selectedQuotationId = null;
    this.isModalOpen = true;
  }

  openEditModal(id: string): void {
    this.currentModal = 'edit';
    this.modalTitle = 'Editar Cotización';
    this.selectedQuotationId = id;
    this.isModalOpen = true;
  }

  openDetailsModal(id: string): void {
    this.currentModal = 'details';
    this.modalTitle = 'Detalles de Cotización';
    this.selectedQuotationId = id;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.currentModal = null;
    this.selectedQuotationId = null;
    this.fetchQuotations(); // Refrescar la lista
  }

  handleSave(event: any): void {
    // Lógica para manejar el guardado, por ejemplo, cerrar el modal
    console.log('Cotización guardada:', event);
    this.closeModal();
  }

  getStatusColor(status: QuotationStatus): string {
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

  getStatusText(status: QuotationStatus): string {
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
