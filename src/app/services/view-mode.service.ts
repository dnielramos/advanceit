import { Injectable, inject, signal, effect, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ViewportService } from './viewport.service';

export type ViewMode = 'grid' | 'list';

@Injectable({
  providedIn: 'root'
})
export class ViewModeService {
  private viewportService = inject(ViewportService);
  private platformId = inject(PLATFORM_ID);
  
  // Signal to hold the current view mode
  readonly viewMode = signal<ViewMode>('grid');

  constructor() {
    // Initialize from LocalStorage if available
    if (isPlatformBrowser(this.platformId)) {
      const savedMode = localStorage.getItem('dashboard_view_mode') as ViewMode;
      if (savedMode && (savedMode === 'grid' || savedMode === 'list')) {
        this.viewMode.set(savedMode);
      }
    }

    // Effect to force grid view on mobile
    effect(() => {
      if (this.viewportService.isMobile()) {
        this.viewMode.set('grid');
      }
    }, { allowSignalWrites: true });
  }

  setViewMode(mode: ViewMode) {
    // Don't allow changing to list view on mobile
    if (this.viewportService.isMobile() && mode === 'list') {
      return;
    }

    this.viewMode.set(mode);
    
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('dashboard_view_mode', mode);
    }
  }
}
