import { Component, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  template: `
    <header class="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between mb-6">
      <h1 class="text-3xl font-black text-slate-800 mb-4 sm:mb-0">{{ title }}</h1>
      <button *ngIf="!isLoggedIn" (click)="buttonClick.emit()" class="flex items-center gap-2 bg-purple-600 text-white font-semibold px-5 py-2.5 rounded-lg shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all">
        <fa-icon [icon]="faPlus"></fa-icon>
        <span>{{ buttonText }}</span>
      </button>
    </header>
  `
})
export class PageHeaderComponent implements OnDestroy {
  @Input() title: string = 'Título de la Página';
  @Input() buttonText: string = 'Acción';
  @Output() buttonClick = new EventEmitter<void>();
  isLoggedIn: boolean = false;
  isLoggedInSubscription: any;
  faPlus = faPlus;


  constructor(private authService: AuthService){
    this.isLoggedInSubscription = this.authService.isLoggedIn$.subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
    });
  }

  ngOnDestroy(): void {
    if (this.isLoggedInSubscription) {
      this.isLoggedInSubscription.unsubscribe();
    }
  }

}
