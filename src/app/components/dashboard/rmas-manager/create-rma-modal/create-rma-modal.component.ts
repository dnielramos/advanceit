import { Component, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTimes, faPaperPlane, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { RmasService } from '../../../../services/rmas.service';
import { CreateRmaDto } from '../../../../models/rma.model';

@Component({
  selector: 'app-create-rma-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './create-rma-modal.component.html',
})
export class CreateRmaModalComponent {
  private readonly rmaService = inject(RmasService);
  private readonly fb = inject(FormBuilder);

  @Output() close = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();

  // Icons
  faTimes = faTimes;
  faPaperPlane = faPaperPlane;
  faSpinner = faSpinner;

  // State
  isLoading = signal(false);
  error = signal<string | null>(null);

  // Form
  createForm: FormGroup;

  constructor() {
    this.createForm = this.fb.group({
      order_id: ['', [Validators.required, Validators.minLength(5)]],
      motivo: ['', [Validators.required, Validators.minLength(10)]],
      items: ['[{"product_id": "SKU123", "quantity": 1}]', [Validators.required, this.jsonValidator]],
    });
  }

  jsonValidator(control: any) {
    try {
      JSON.parse(control.value);
      return null;
    } catch (e) {
      return { invalidJson: true };
    }
  }

  handleSubmit(): void {
    if (this.createForm.invalid) {
      this.error.set('Formulario inválido. Revisa los campos.');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    try {
      const formValue = this.createForm.value;
      const dto: CreateRmaDto = {
        order_id: formValue.order_id,
        motivo: formValue.motivo,
        items: JSON.parse(formValue.items),
      };

      this.rmaService.createRma(dto).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.created.emit();
        },
        error: (err) => {
          this.isLoading.set(false);
          this.error.set(`Error al crear la RMA: ${err.error?.message || err.message}`);
        },
      });
    } catch (e) {
      this.isLoading.set(false);
      this.error.set('Error al parsear los items. Asegúrate que sea un JSON válido.');
    }
  }

  closeModal(): void {
    this.close.emit();
  }
}
