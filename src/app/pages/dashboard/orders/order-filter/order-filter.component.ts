import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface FilterData {
  numeroOrden?: string;
  estado?: string;
}

export interface ResumenData {
  total: number;
  pagado: number;
  pendiente: number;
  cancelado: number;
}

@Component({
  selector: 'app-order-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order-filter.component.html',
})
export class OrderFilterComponent {
  @Input() filters: FilterData = {};
  @Input() resumen: ResumenData = { total: 0, pagado: 0, pendiente: 0, cancelado: 0 };

  @Output() filtersChange = new EventEmitter<FilterData>();
  @Output() clearFilters = new EventEmitter<void>();

  onFilterChange(): void {
    this.filtersChange.emit(this.filters);
  }
}
