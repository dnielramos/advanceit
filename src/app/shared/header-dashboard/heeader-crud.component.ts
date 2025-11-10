import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faRotateRight, faTh, faList } from '@fortawesome/free-solid-svg-icons';
import { FilterData } from '../../pages/dashboard/orders/order-filter/order-filter.component';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { CapitalizeStatusPipe } from '../../pipes/capitalizar-estados.pipe';

@Component({
  selector: 'app-header-crud',
  templateUrl: './header-crud.component.html',
  standalone: true,
  imports: [FormsModule, FontAwesomeModule, NgIf, NgFor, NgClass, CapitalizeStatusPipe]
})
export class HeaderCrudComponent {
  faPlus = faPlus;
  faRotateRight = faRotateRight;
  faTh = faTh;
  faList = faList;

  // Inputs principales
  @Input() titulo: string = 'Registros';
  @Input() descripcion: string = 'Gestiona tus datos de forma eficiente';
  @Input() textoBotonNuevo !: string ;
  @Input() textoBotonActualizar: string = 'Actualizar';

  // Filtros
  @Input() filterByStatus: boolean = false;
  @Input() filterStatusValues: string[] = [];
  @Input() placeholderInput: string = 'Buscar...';

  // Cambio de vista
  @Input() showViewToggle: boolean = false;
  @Input() currentView: 'grid' | 'list' = 'grid';

  // Estado interno de los filtros
  filters = {
    texto: '',
    estado: ''
  };

  // Eventos
  @Output() crear = new EventEmitter<void>();
  @Output() actualizar = new EventEmitter<void>();
  @Output() filterChange = new EventEmitter<{ texto: string; estado: string }>();
  @Output() clearFilters = new EventEmitter<void>();
  @Output() viewChange = new EventEmitter<'grid' | 'list'>();

  onFilterChange(): void {
    this.filterChange.emit({ ...this.filters });
  }

  onClearFilters(): void {
    this.filters.texto = '';
    this.filters.estado = '';
    this.clearFilters.emit();
  }

  openCreate(): void {
    this.crear.emit();
  }

  refresh(): void {
    this.actualizar.emit();
  }

  changeView(mode: 'grid' | 'list'): void {
    this.viewChange.emit(mode);
  }
}
