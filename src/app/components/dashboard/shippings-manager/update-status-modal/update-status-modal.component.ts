import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faImage, faSpinner } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-update-status-modal',
  standalone: true,
  templateUrl: './update-status-modal.component.html',
  imports: [CommonModule, FormsModule, FontAwesomeModule],
})
export class UpdateStatusModalComponent {
  @Input() isOpen = false;
  @Input() isSubmitting = false;
  @Input() availableStatuses: string[] = [];
  @Input() updateStatusPayload: any = {};
  @Input() guiaImagePreview: string | null = null;
  @Input() fileError: string | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() submit = new EventEmitter<NgForm>();
  @Output() fileSelected = new EventEmitter<Event>();

  faImage: IconDefinition = faImage;
  faSpinner: IconDefinition = faSpinner;

  // Métodos
  handleClose() {
    this.close.emit();
  }

  handleSubmit(form: NgForm) {
    if (this.isSubmitting) {
      console.warn('Submit bloqueado: ya se está enviando');
      return;
    }
    this.submit.emit(form);
  }

  onFileSelected(event: Event) {
    this.fileSelected.emit(event);
  }

  getStatusInfo(status: string) {
    // Ejemplo genérico, puedes reemplazar con tu lógica actual
    const labels: Record<string, any> = {
      pendiente: { label: 'Pendiente' },
      en_transito: { label: 'En Tránsito' },
      entregado: { label: 'Entregado' },
      cancelado: { label: 'Cancelado' },
    };
    return labels[status] || { label: status };
  }
}
