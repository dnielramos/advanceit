import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Quotation } from '../../../services/quotation.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEye, faPen } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-quotation-list',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './quotation-list.component.html'
})
export class QuotationListComponent {
  @Input() quotations: Quotation[] = [];
  @Output() view = new EventEmitter<Quotation>();
  @Output() edit = new EventEmitter<Quotation>();

  icons = { faEye, faPen };
}
