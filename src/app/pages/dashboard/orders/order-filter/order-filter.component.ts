import { Component, Input } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';

@Component({
    selector: 'app-order-filter',
    imports: [FormsModule],
    standalone: true,
    templateUrl: './order-filter.component.html',
    styleUrls: ['./order-filter.component.css']
})
export class OrderFilterComponent {
    @Input() filterNumeroOrden !: string;
    @Input() $event: any;
    @Input() onFilterChange !: () => void;
    @Input() filterEstado !: string;
    @Input() clearFilters !: () => void;
    @Input() resumen !: any;
    constructor () {}
}
