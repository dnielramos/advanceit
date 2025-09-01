import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Quotation, QuotationService } from '../../../services/quotation.service';

@Component({
  selector: 'app-quotation-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quotation-edit.component.html'
})
export class QuotationEditComponent {
  private quotationService = inject(QuotationService);

  @Input() quotation !: Quotation;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  save() {
    if (!this.quotation) return;
    this.quotationService.update(this.quotation.id, this.quotation).subscribe(() => {
      this.saved.emit();
      this.close.emit();
    });
  }
}
