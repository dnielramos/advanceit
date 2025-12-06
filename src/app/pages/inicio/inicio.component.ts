import { Component} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FooterComponent } from '../../components/footer/footer.component';
import { SliderInicioComponent } from '../../components/inicio/slider-inicio/slider-inicio.component';
import { SimpleCtaComponent } from "../../components/inicio/simple-cta/simple-cta.component";
import { DellPartnerHeroComponent } from "../../components/inicio/dell-partner-hero/dell-partner-hero.component";
import { DellExpertiseComponent } from "../../components/inicio/dell-expertise/dell-expertise.component";
import { WhatMostComponent } from "../../components/inicio/what-most/what-most.component";
import { TitleMapsComponent } from "../../components/inicio/title-maps/title-maps.component";
import { CategoriesInicioComponent } from "../../components/inicio/categories-inicio/categories-inicio.component";
import { WorkforceStaffingComponent } from "../../components/inicio/workforce-staffing/workforce-staffing.component";
import { ImageDescriptionComponent } from "../../components/inicio/image-description/image-description.component";
import { SocialImpactComponent } from "../../components/inicio/social-impact/social-impact.component";
import { SimpleTitleSectionComponent } from "../../components/inicio/simple-title-section/simple-title-section.component";
import { BrandSliderComponent } from "../../shared/brand-slider/brand-slider.component";
import { AnimateOnScrollDirective } from '../../shared/directives/animate-on-scroll.directive';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, FooterComponent, SliderInicioComponent, SimpleCtaComponent, WhatMostComponent, TitleMapsComponent, CategoriesInicioComponent, WorkforceStaffingComponent, ImageDescriptionComponent, SocialImpactComponent, SimpleTitleSectionComponent, BrandSliderComponent],
template: `
    <!-- Contenedor principal para separar el contenido del navbar si está fixed -->
    <div class="w-screen max-w-full overflow-hidden">
      <!-- SLIDER (fondo e imágenes) -->
      <app-slider-inicio></app-slider-inicio>

      <!-- NUEVA SECCIÓN: "BECOME AN EARLY ADOPTER OF AI" -->
      <app-simple-cta ></app-simple-cta>

      <app-brand-slider></app-brand-slider>

      <!-- NUEVA SECCIÓN: "What's Most Important" -->
      <app-what-most
      noteText="home.whatMostNoteText"
        title="home.whatMostTitle"
        description = "home.whatMostP1"
        footerText="home.whatMostFooterText"
        buttonText="home.whatMostButtonText"
      ></app-what-most>

      <app-simple-cta title="home.simpleTitle"></app-simple-cta>

      <app-categories-inicio></app-categories-inicio>

      <app-title-maps></app-title-maps>

      <app-workforce-staffing></app-workforce-staffing>

      <!-- <app-optimization-insights></app-optimization-insights> -->

      <!-- Image Description con lazy loading -->
      @defer (on viewport) {
        <div appAnimateOnScroll="animate__fadeInLeft" animationDuration="0.9s">
          <app-image-description></app-image-description>
        </div>
      } @placeholder {
        <div class="min-h-[400px] bg-gray-50 animate-pulse"></div>
      }

      <!-- Social Impact con lazy loading -->
      @defer (on viewport) {
        <div appAnimateOnScroll="animate__fadeInUp" animationDuration="0.8s">
          <app-social-impact></app-social-impact>
        </div>
      } @placeholder {
        <div class="min-h-[350px] bg-white animate-pulse"></div>
      }

      <!-- Simple Title Section con lazy loading -->
      @defer (on viewport) {
        <div appAnimateOnScroll="animate__fadeInUp" animationDuration="0.8s">
          <app-simple-title-section></app-simple-title-section>
        </div>
      } @placeholder {
        <div class="min-h-[250px] bg-purple-50 animate-pulse"></div>
      }
    </div>

    <!-- Footer con lazy loading -->
    @defer (on viewport) {
      <div appAnimateOnScroll="animate__fadeIn" animationDuration="0.6s">
        <app-footer></app-footer>
      </div>
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
