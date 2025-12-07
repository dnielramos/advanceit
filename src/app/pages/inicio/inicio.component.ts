import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FooterComponent } from '../../components/footer/footer.component';
import { SliderInicioComponent } from '../../components/inicio/slider-inicio/slider-inicio.component';
import { SimpleCtaComponent } from "../../components/inicio/simple-cta/simple-cta.component";
import { DellPartnerHeroComponent } from "../../components/inicio/dell-partner-hero/dell-partner-hero.component";
import { DellExpertiseComponent } from "../../components/inicio/dell-expertise/dell-expertise.component";
import { WhatMostComponent } from "../../components/inicio/what-most/what-most.component";
import { TitleMapsComponent } from "../../components/inicio/title-maps/title-maps.component";
import { CategoriesInicioComponent } from "../../components/inicio/categories-inicio/categories-inicio.component";
import { ImageDescriptionComponent } from "../../components/inicio/image-description/image-description.component";
import { SocialImpactComponent } from "../../components/inicio/social-impact/social-impact.component";
import { SimpleTitleSectionComponent } from "../../components/inicio/simple-title-section/simple-title-section.component";
import { BrandSliderComponent } from "../../shared/brand-slider/brand-slider.component";

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [
    CommonModule, 
    FooterComponent, 
    SliderInicioComponent, 
    SimpleCtaComponent, 
    DellPartnerHeroComponent, 
    DellExpertiseComponent, 
    WhatMostComponent, 
    TitleMapsComponent, 
    CategoriesInicioComponent, 
    ImageDescriptionComponent, 
    SocialImpactComponent, 
    SimpleTitleSectionComponent, 
    BrandSliderComponent
  ],
  template: `
    <!-- Contenedor principal -->
    <div class="w-screen max-w-full overflow-hidden">
      <!-- SLIDER -->
      <div class="animate__animated animate__fadeIn">
        <app-slider-inicio></app-slider-inicio>
      </div>

      <!-- Simple CTA -->
      <div class="reveal-section">
        <app-simple-cta></app-simple-cta>
      </div>

      <!-- Dell Partner Hero -->
      @defer (on viewport) {
        <div class="reveal-section">
          <app-dell-partner-hero></app-dell-partner-hero>
        </div>
      } @placeholder {
        <div class="min-h-[400px] bg-gray-50"></div>
      }

      <!-- Dell Expertise -->
      @defer (on viewport) {
        <div class="reveal-section">
          <app-dell-expertise></app-dell-expertise>
        </div>
      } @placeholder {
        <div class="min-h-[500px] bg-white"></div>
      }

      <!-- What's Most Important -->
      @defer (on viewport) {
        <div class="reveal-section">
          <app-what-most
            noteText="home.whatMostNoteText"
            title="home.whatMostTitle" 
            description="home.whatMostP1"      
            footerText="home.whatMostFooterText"      
            buttonText="home.whatMostButtonText">
          </app-what-most>
        </div>
      } @placeholder {
        <div class="min-h-[300px] bg-white"></div>
      }
      
      <!-- Simple CTA secundario -->
      @defer (on viewport) {
        <div class="reveal-section">
          <app-simple-cta title="home.simpleTitle"></app-simple-cta>
        </div>
      } @placeholder {
        <div class="min-h-[200px] bg-gray-50"></div>
      }

      <!-- Categories -->
      @defer (on viewport) {
        <div class="reveal-section">
          <app-categories-inicio></app-categories-inicio>
        </div>
      } @placeholder {
        <div class="min-h-[400px] bg-white"></div>
      }

      <!-- Brand Slider -->
      @defer (on viewport) {
        <div class="reveal-section">
          <app-brand-slider></app-brand-slider>
        </div>
      } @placeholder {
        <div class="min-h-[150px] bg-gray-50"></div>
      }

      <!-- Title Maps -->
      @defer (on viewport) {
        <div class="reveal-section">
          <app-title-maps></app-title-maps>
        </div>
      } @placeholder {
        <div class="min-h-[350px] bg-white"></div>
      }

      <!-- Image Description -->
      @defer (on viewport) {
        <div class="reveal-section">
          <app-image-description></app-image-description>
        </div>
      } @placeholder {
        <div class="min-h-[400px] bg-gray-50"></div>
      }

      <!-- Social Impact -->
      @defer (on viewport) {
        <div class="reveal-section">
          <app-social-impact></app-social-impact>
        </div>
      } @placeholder {
        <div class="min-h-[350px] bg-white"></div>
      }

      <!-- Simple Title Section -->
      @defer (on viewport) {
        <div class="reveal-section">
          <app-simple-title-section></app-simple-title-section>
        </div>
      } @placeholder {
        <div class="min-h-[250px] bg-gray-50"></div>
      }
    </div>

    <!-- Footer -->
    @defer (on viewport) {
      <div class="reveal-section">
        <app-footer></app-footer>
      </div>
    } @placeholder {
      <div class="min-h-[300px] bg-gray-900"></div>
    }
  `,
  styles: [`
    :host {
      display: block;
    }

    /* Animación de revelado suave y profesional */
    .reveal-section {
      opacity: 0;
      transform: translateY(30px);
      animation: revealSmooth 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
    }

    @keyframes revealSmooth {
      0% {
        opacity: 0;
        transform: translateY(30px);
      }
      100% {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Delays escalonados para efecto cascada suave */
    .reveal-section:nth-child(1) { animation-delay: 0s; }
    .reveal-section:nth-child(2) { animation-delay: 0.1s; }
    .reveal-section:nth-child(3) { animation-delay: 0.15s; }
    .reveal-section:nth-child(4) { animation-delay: 0.2s; }
    .reveal-section:nth-child(5) { animation-delay: 0.25s; }
  `],
})
export class InicioComponent {

}
