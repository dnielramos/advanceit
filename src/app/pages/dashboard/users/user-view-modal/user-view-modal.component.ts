// src/app/components/user-view-modal/user-view-modal.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { User } from '../../../../models/user';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-view-modal',
  imports: [CommonModule],
  templateUrl: './user-view-modal.component.html'
})
export class UserViewModalComponent {
  @Input() user : User | null = null;
  @Output() closeModal = new EventEmitter<void>();

  constructor() {}

  close(): void {
    this.closeModal.emit();
  }
}
