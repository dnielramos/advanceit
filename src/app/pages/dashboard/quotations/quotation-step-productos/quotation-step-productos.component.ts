import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormArray, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-quotation-step-productos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './quotation-step-productos.component.html',
})
export class QuotationStepProductosComponent {
  @Input() details!: FormArray;
  @Output() addProduct = new EventEmitter<void>();
  @Output() removeDetail = new EventEmitter<number>();

  onRemove(index: number): void {
    // Emite el evento hacia el padre con el índice a eliminar
    this.removeDetail.emit(index);
  }

  onAdd(): void {
    // Emite el evento para que el padre abra el modal/página
    this.addProduct.emit();
  }
}
