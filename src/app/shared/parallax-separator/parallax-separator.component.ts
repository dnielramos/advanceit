import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParallaxDirective } from '../directives/parallax.directive';

@Component({
  selector: 'app-parallax-separator',
  standalone: true,
  imports: [CommonModule, ParallaxDirective],
  template: `
    <div class="parallax-container relative overflow-hidden w-full" [style.height]="height">
      <div 
        class="parallax-bg absolute left-0 w-full bg-cover bg-center will-change-transform"
        [style.background-image]="'url(' + imageUrl + ')'"
        [style.height]="'140%'"
        [style.top]="'-20%'"
        [appParallax]="0.4">
        
        <!-- Overlay oscuro para mejorar legibilidad y dar toque premium -->
        <div class="absolute inset-0 bg-black/30"></div>
      </div>
      
      <!-- Contenido opcional centrado -->
      <div class="relative z-10 h-full flex items-center justify-center text-white">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: []
})
export class ParallaxSeparatorComponent {
  @Input() imageUrl: string = '';
  @Input() height: string = '400px';
}
