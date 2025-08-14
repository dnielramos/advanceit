import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChildren, QueryList, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-slider-product',
  templateUrl: './slider-product.component.html',
  standalone: true,
  imports: [CommonModule]
})
export class SliderProductComponent implements AfterViewInit {
  currentSlide = 0;

  @ViewChildren('videoFondo') videoRefs!: QueryList<ElementRef<HTMLVideoElement>>;

  ngAfterViewInit() {
    this.playAndSlowCurrentVideo();
    this.videoRefs.changes.subscribe(() => {
      this.playAndSlowCurrentVideo();
    });
  }

  banners = [
    {
      title: 'Distribuidores Autorizados Dell',
      description: 'Proveemos hardware autorizado por las grandes marcas.',
      buttonText: 'Shop Now',
      image: '/products/notebook-latitude-14-7450-t-gray-gallery-1.avif',
      background: 'url(banners/background.jpeg)',
      video: 'banners/videobanner.webm'
    },
    {
      title: 'Dell Latitude 14 5440',
      description: 'Equipo portátil de alta gama con procesadores Intel Core de última generación.',
      buttonText: 'See Plans',
      image: '/products/notebook-latitude-14-5440-nt-gray-gallery-2.avif',
      background: 'url(banners/background.jpeg)',
      video: 'banners/videobanner.webm'
    }
  ];

  playAndSlowCurrentVideo() {
    if (this.videoRefs && this.videoRefs.length > 0) {
      this.videoRefs.forEach((videoRef, index) => {
        const video = videoRef.nativeElement;
        if (index === this.currentSlide) {
          video.playbackRate = 0.5;
          video.play();
        } else {
          video.pause();
        }
      });
    }
  }

  prevSlide() {
    this.currentSlide = (this.currentSlide - 1 + this.banners.length) % this.banners.length;
    this.playAndSlowCurrentVideo();
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.banners.length;
    this.playAndSlowCurrentVideo();
  }

  goToSlide(index: number) {
    this.currentSlide = index;
    this.playAndSlowCurrentVideo();
  }
}
