import { Component, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrmService } from '../../../services/trm.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-trm',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="bg-white rounded max-w-250 mx-auto relative">
      <div class="relative">
        <div #widgetContainer class="text-xs bg-rose-500 text-center flex items-center justify-center"></div>
        <div
          *ngIf="!(trmService.widgetLoaded$ | async)"
          class="absolute inset-0 flex animate-pulse items-center justify-center"
        >
          <div class="animate-pulse space-y-2 w-150">
            <div class="h-4 w-1/2 bg-rose-300 rounded mx-auto"></div>
          </div>
        </div>
      </div>
      <div id="dolar_wpc4" class="hidden">
        <a href="https://dolar.wilkinsonpc.com.co/" target="_new">
          Precio del Dólar Hoy
        </a>
      </div>
    </section>
  `,
})
export class TrmComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(
    private elementRef: ElementRef,
    public trmService: TrmService
  ) {}

  ngOnInit(): void {
    const widgetContainer = this.elementRef.nativeElement.querySelector('[widgetContainer]') ||
                          this.elementRef.nativeElement.querySelector('div');

    this.trmService.loadWidget(widgetContainer)
      .catch(error => console.error('Error loading TRM widget:', error));
  }

  ngOnDestroy(): void {
    this.trmService.cleanup();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
