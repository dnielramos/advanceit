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
      <!-- SLIDER - Carga inmediata -->
      <app-slider-inicio></app-slider-inicio>

      <!-- Simple CTA -->
      <app-simple-cta></app-simple-cta>

      <!-- Dell Partner Hero -->
      @defer (on viewport; prefetch on idle) {
        <app-dell-partner-hero></app-dell-partner-hero>
      } @placeholder {
        <div class="min-h-[400px] bg-gradient-to-br from-gray-900 to-gray-800 animate-pulse"></div>
      }

      <!-- Dell Expertise -->
      @defer (on viewport; prefetch on idle) {
        <app-dell-expertise></app-dell-expertise>
      } @placeholder {
        <div class="min-h-[500px] bg-white animate-pulse"></div>
      }

      <!-- What's Most Important -->
      @defer (on viewport; prefetch on idle) {
        <app-what-most
          noteText="home.whatMostNoteText"
          title="home.whatMostTitle" 
          description="home.whatMostP1"      
          footerText="home.whatMostFooterText"      
          buttonText="home.whatMostButtonText">
        </app-what-most>
      } @placeholder {
        <div class="min-h-[300px] bg-white animate-pulse"></div>
      }
      
      <!-- Simple CTA secundario -->
      @defer (on viewport; prefetch on idle) {
        <app-simple-cta title="home.simpleTitle"></app-simple-cta>
      } @placeholder {
        <div class="min-h-[100px] bg-white animate-pulse"></div>
      }

      <!-- Categories -->
      @defer (on viewport; prefetch on idle) {
        <app-categories-inicio></app-categories-inicio>
      } @placeholder {
        <div class="min-h-[400px] bg-white animate-pulse"></div>
      }

      <!-- Brand Slider -->
      @defer (on viewport; prefetch on idle) {
        <app-brand-slider></app-brand-slider>
      } @placeholder {
        <div class="min-h-[150px] bg-gray-50 animate-pulse"></div>
      }

      <!-- Title Maps -->
      @defer (on viewport; prefetch on idle) {
        <app-title-maps></app-title-maps>
      } @placeholder {
        <div class="min-h-[350px] bg-white animate-pulse"></div>
      }

      <!-- Image Description -->
      @defer (on viewport; prefetch on idle) {
        <app-image-description></app-image-description>
      } @placeholder {
        <div class="min-h-[400px] bg-gray-50 animate-pulse"></div>
      }

      <!-- Social Impact -->
      @defer (on viewport; prefetch on idle) {
        <app-social-impact></app-social-impact>
      } @placeholder {
        <div class="min-h-[350px] bg-white animate-pulse"></div>
      }

      <!-- Simple Title Section -->
      @defer (on viewport; prefetch on idle) {
        <app-simple-title-section></app-simple-title-section>
      } @placeholder {
        <div class="min-h-[250px] bg-purple-50 animate-pulse"></div>
      }
    </div>

    <!-- Footer -->
    @defer (on viewport; prefetch on idle) {
      <app-footer></app-footer>
    } @placeholder {
      <div class="min-h-[300px] bg-gray-900 animate-pulse"></div>
    }
  `,
  styles: [`
    :host {
      display: block;
    }
  `],
})
export class InicioComponent {

}
