import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-slider-product',
  templateUrl: './slider-product.component.html',
  imports: [CommonModule]
})
export class SliderProductComponent {
  currentSlide = 0;

  banners = [
    {
      title: 'Distribuidores Autorizados Dell',
      description: 'Proveemos hardware autorizado por las grandes marcas.',
      buttonText: 'Shop Now',
      image: '/products/notebook-latitude-14-7450-t-gray-gallery-1.avif',
     background: 'url(https://wahlaptopstore.weebly.com/uploads/1/1/6/6/116678227/logo-banner-51_orig.jpg)'
    },
    // {
    //   title: 'Gaming Power Unleashed',
    //   description: 'Equip your setup with the best gaming hardware.',
    //   buttonText: 'Explore',
    //   image: '/products/notebook-latitude-14-7450-t-gray-gallery-1.avif',
    //   background: 'linear-gradient(to right, #141e30, #243b55)'
    // },
    // {
    //   title: 'Student Essentials',
    //   description: 'Affordable and powerful laptops for study and productivity.',
    //   buttonText: 'View Offers',
    //   image: '/products/notebook-latitude-14-7450-t-gray-gallery-1.avif',
    //   background: 'linear-gradient(to right, #56ccf2, #2f80ed)'
    // },
    // {
    //   title: 'Designer’s Choice',
    //   description: 'High-resolution screens and powerful GPUs for creatives.',
    //   buttonText: 'Get Inspired',
    //   image: '/products/notebook-latitude-14-7450-t-gray-gallery-1.avif',
    //   background: 'linear-gradient(to right, #ff4e50, #f9d423)'
    // },
    {
      title: 'Business Ready',
      description: 'Professional laptops with enhanced security and performance.',
      buttonText: 'See Plans',
      image: '/products/notebook-latitude-14-5440-nt-gray-gallery-2.avif',
      background: 'url(banners/gemini2.jpg)'
    }
  ];

  prevSlide() {
    this.currentSlide = (this.currentSlide - 1 + this.banners.length) % this.banners.length;
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.banners.length;
  }

  goToSlide(index: number) {
    this.currentSlide = index;
  }
}
