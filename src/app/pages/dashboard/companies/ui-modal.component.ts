import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  FaIconLibrary,
  FontAwesomeModule,
} from '@fortawesome/angular-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

// ===== Modal base reutilizable =====
@Component({
  selector: 'ui-modal',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-gray-900/60" (click)="close.emit()"></div>

      <!-- Modal card -->
      <div
        class="relative w-full max-w-3xl mx-4 animate__animated animate__fadeInUp rounded-2xl shadow-2xl bg-white"
      >
        <div
          class="flex items-center justify-between px-6 py-4 rounded-t-2xl bg-gradient-to-r from-purple-600 to-purple-500 text-white"
        >
          <h3 class="text-lg font-semibold">{{ title }}</h3>
          <button
            class="p-2 hover:scale-105 transition"
            (click)="close.emit()"
            aria-label="Cerrar"
          >
            <fa-icon [icon]="['fas', 'xmark']"></fa-icon>
          </button>
        </div>
        <div class="p-6">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `,
})
export class UiModalComponent {
  @Input() title = '';
  @Output() close = new EventEmitter<void>();
  constructor(lib: FaIconLibrary) {
    lib.addIcons(faXmark);
  }
}
