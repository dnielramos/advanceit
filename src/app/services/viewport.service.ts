import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ViewportService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly mobileBreakpoint = 1024; // Tailwind's lg breakpoint
  private readonly _isMobile = signal(this.calculateIsMobile());

  readonly isMobile = this._isMobile.asReadonly();

  constructor() {
    if (this.isBrowser) {
      fromEvent(window, 'resize')
        .pipe(debounceTime(150))
        .subscribe(() => {
          const nextValue = this.calculateIsMobile();
          if (nextValue !== this._isMobile()) {
            this._isMobile.set(nextValue);
          }
        });
    }
  }

  private calculateIsMobile(): boolean {
    if (!this.isBrowser) {
      return false;
    }
    return window.innerWidth < this.mobileBreakpoint;
  }
}
