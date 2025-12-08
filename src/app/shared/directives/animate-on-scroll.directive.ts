import { Directive, ElementRef, Input, OnInit, OnDestroy, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appAnimateOnScroll]',
  standalone: true
})
export class AnimateOnScrollDirective implements OnInit, OnDestroy {
  @Input() appAnimateOnScroll: string = 'animate__fadeInUp';
  @Input() animationDelay: string = '0s';
  @Input() animationDuration: string = '1s';
  @Input() threshold: number = 0.1;
  @Input() animateOnce: boolean = true;

  private observer: IntersectionObserver | null = null;
  private hasAnimated = false;
  private isBrowser: boolean;

  constructor(
    private el: ElementRef,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;

    // Configurar estilos iniciales
    this.el.nativeElement.style.opacity = '0';
    this.el.nativeElement.style.animationDuration = this.animationDuration;
    this.el.nativeElement.style.animationDelay = this.animationDelay;

    // Crear el observer
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (this.animateOnce && this.hasAnimated) return;
            
            this.el.nativeElement.style.opacity = '1';
            this.el.nativeElement.classList.add('animate__animated', this.appAnimateOnScroll);
            this.hasAnimated = true;

            if (this.animateOnce && this.observer) {
              this.observer.unobserve(this.el.nativeElement);
            }
          } else if (!this.animateOnce) {
            this.el.nativeElement.style.opacity = '0';
            this.el.nativeElement.classList.remove('animate__animated', this.appAnimateOnScroll);
          }
        });
      },
      { threshold: this.threshold }
    );

    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
