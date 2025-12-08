import { Directive, ElementRef, Input, NgZone, OnDestroy, AfterViewInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appParallax]',
  standalone: true
})
export class ParallaxDirective implements AfterViewInit, OnDestroy {
  @Input('appParallax') ratio: number = 0.5;
  
  private initialTop: number = 0;
  private scrollListener: (() => void) | null = null;

  constructor(private el: ElementRef, private renderer: Renderer2, private zone: NgZone) {}

  ngAfterViewInit() {
    // Calculate initial position relative to document
    const rect = this.el.nativeElement.getBoundingClientRect();
    this.initialTop = rect.top + window.scrollY;
    
    // Run scroll listener outside Angular zone to prevent excessive change detection
    this.zone.runOutsideAngular(() => {
      this.scrollListener = this.renderer.listen('window', 'scroll', () => {
        requestAnimationFrame(() => {
          this.updatePosition();
        });
      });
    });
    
    // Initial update
    this.updatePosition();
  }

  ngOnDestroy() {
    if (this.scrollListener) {
      this.scrollListener();
    }
  }

  private updatePosition() {
    const scrollPosition = window.scrollY;
    // Calculate offset based on scroll position relative to element's initial position
    // We want the background to move SLOWER than the scroll, so we move it in the SAME direction as scroll (down)
    // but by a fraction.
    const offset = (scrollPosition - this.initialTop) * this.ratio;
    
    this.renderer.setStyle(this.el.nativeElement, 'transform', `translate3d(0, ${offset}px, 0)`);
  }
}
