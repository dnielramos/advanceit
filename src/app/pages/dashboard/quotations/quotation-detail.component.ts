import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Quotation } from '../../../services/quotation.service';

@Component({
  selector: 'app-quotation-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quotation-detail.component.html'
})
export class QuotationDetailComponent {
  @Input() quotation !: Quotation;
  @Output() close = new EventEmitter<void>();
}
