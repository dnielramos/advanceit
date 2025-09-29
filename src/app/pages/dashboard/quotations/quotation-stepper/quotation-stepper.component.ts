import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-quotation-stepper',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quotation-stepper.component.html',
})
export class QuotationStepperComponent {
  @Input() currentStep: number = 1;
}
