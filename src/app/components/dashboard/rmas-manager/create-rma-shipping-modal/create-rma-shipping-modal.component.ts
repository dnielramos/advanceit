import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTimes, faPaperPlane, faSpinner, faTruck, faMapMarkerAlt, faCalendarAlt, faStickyNote } from '@fortawesome/free-solid-svg-icons';
import { ShippingsService, CreateShippingDto } from '../../../../services/shippings.service';
import { AuthService } from '../../../../services/auth.service';
import { ToastService } from 'angular-toastify';

@Component({
  selector: 'app-create-rma-shipping-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './create-rma-shipping-modal.component.html',
})
export class CreateRmaShippingModalComponent {
  private readonly fb = inject(FormBuilder);
  private readonly shippingsService = inject(ShippingsService);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);

  @Output() close = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();

  // Icons
  faTimes = faTimes;
  faPaperPlane = faPaperPlane;
  faSpinner = faSpinner;
  faTruck = faTruck;
  faMapMarkerAlt = faMapMarkerAlt;
  faCalendarAlt = faCalendarAlt;
  faStickyNote = faStickyNote;

  // State
  isLoading = signal(false);
  createForm: FormGroup;

  constructor() {
    this.createForm = this.fb.group({
      order_id: [{ value: 'ADVANCE_RMA_SHIPPING', disabled: true }, [Validators.required]],
      direccion_entrega: ['', [Validators.required, Validators.minLength(5)]],
      transportadora: ['', [Validators.required]],
      guia: [''],
      fechaEstimada: [''],
      notas: [''],
    });
  }

  handleSubmit(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const formValue = this.createForm.getRawValue(); // getRawValue to include disabled fields

    const dto: CreateShippingDto = {
      order_id: formValue.order_id,
      direccion_entrega: formValue.direccion_entrega,
      transportadora: formValue.transportadora,
      guia: formValue.guia || undefined,
      fechaEstimada: formValue.fechaEstimada || undefined,
      notas: formValue.notas || undefined,
      user_id: this.authService.getUserId() || '',
    };

    this.shippingsService.createShipping(dto).subscribe({
      next: () => {
        this.toast.success('Orden de envío creada correctamente');
        this.isLoading.set(false);
        this.created.emit();
        this.close.emit();
      },
      error: (err) => {
        console.error('Error creating shipping:', err);
        this.toast.error(`Error al crear envío: ${err.error?.message || err.message}`);
        this.isLoading.set(false);
      },
    });
  }

  closeModal(): void {
    this.close.emit();
  }
}
