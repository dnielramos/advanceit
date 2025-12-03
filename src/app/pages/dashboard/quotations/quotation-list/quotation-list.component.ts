import { Component, Input, OnInit, signal } from '@angular/core';
import { QuotationService } from '../../../../services/quotation.service';
import {
  PopulatedQuotation,
  Quotation,
  QuotationStatus,
} from '../../../../models/quotation.types';
import {
  faPlus,
  faFileInvoice,
  faEye,
  faEdit,
  faCheckCircle,
  faTrashAlt,
  faTimes,
  faUser,
  faDollarSign,
  faCalendarAlt,
  faBoxOpen,
  faBuilding,
  faFilePdf,
} from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
import { QuotationFormComponent } from '../quotation-form/quotation-form.component';
import { QuotationDetailComponent } from '../../quotations/quotation-detail/quotation-detail.component';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AngularToastifyModule, ToastService } from 'angular-toastify';
import { HeaderCrudComponent } from '../../../../shared/header-dashboard/heeader-crud.component';
import { SkeletonCardComponent } from '../../../../components/skeleton-card/skeleton-card.component';
import { SkeletonTableComponent } from '../../../../components/skeleton-table/skeleton-table.component';

@Component({
  imports: [
    QuotationFormComponent,
    QuotationDetailComponent,
    CommonModule,
    FontAwesomeModule,
    AngularToastifyModule,
    SkeletonCardComponent,
    SkeletonTableComponent
  ],
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
  @Input({ required: true }) quotations: PopulatedQuotation[] = [];
  @Input() isLoading: boolean = false;
  // View mode signal
  viewMode = signal<'grid' | 'list'>('grid');
  // Allow parent to control view mode
  @Input() set externalView(mode: 'grid' | 'list' | undefined) {
    if (mode) this.viewMode.set(mode);
  }
  isModalOpen = false;
  currentModal: 'create' | 'edit' | 'details' | 'status' | null = null;
  selectedQuotationId: string | null = null;
  modalTitle = '';

  //icons
  toastQuotation: any;

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
  faBuilding = faBuilding;
  faBoxOpen = faBoxOpen;
  faFilePdf = faFilePdf;

  constructor(
    private quotationService: QuotationService,
    private router: Router,
    private toastService: ToastService
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.toastQuotation = navigation.extras.state;
    }
  }

  ngOnInit(): void {

    if (this.toastQuotation) {
      this.toastService.success(
        `Cotización creada exitosamente ${this.toastQuotation.id}`
      );
      this.toastQuotation = null;
    }
  }

  handleViewChange(mode: 'grid' | 'list'): void {
    this.viewMode.set(mode);
  }

  fetchQuotations(): void {
    this.isLoading = true;
    this.quotationService.findAllPopulated().subscribe({
      next: (data) => {
        this.quotations = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching quotations:', err);
        this.isLoading = false;
      },
    });
  }

  openEditModal(id: string): void {
    this.currentModal = 'edit';
    this.modalTitle = 'Editar Cotización';
    this.selectedQuotationId = id;
    this.isModalOpen = true;
  }

  openDetailsModal(id: string): void {
    // Navigate to detail route instead of opening modal
    this.router.navigate(['/dashboard/cotizaciones', id]);
  }

  printQuotation(id: string): void {
    this.router.navigate(['/dashboard/cotizaciones', id], {
      queryParams: { print: '1' },
    });
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
    alert(
      'Cotización guardada exitosamente. Hemos enviado un correo de confirmación.'
    );
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

  calculateExpirationDate(creationDate: Date | string, days: number): Date {
    const date = new Date(creationDate);
    date.setDate(date.getDate() + days);
    return date;
  }
}
