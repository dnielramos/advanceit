import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronRight, faTags } from '@fortawesome/free-solid-svg-icons';
import { BrandsService, Brand } from '../../../services/brands.service';

@Component({
  selector: 'app-brand-menu',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './brand-menu.component.html',
  styles: [`.font-sans { font-family: 'Inter', sans-serif; }`]
})
export class BrandMenuComponent implements OnInit {
  // Íconos
  faChevronRight = faChevronRight;
  faTags = faTags;

  @Output() showOtherBrand = new EventEmitter<void>();

  // Estado
  brands: Brand[] = [];

  constructor(
    private brandsService: BrandsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.brandsService.brands$.subscribe(b => {
      this.brands = b;
    });
  }

  /**
   * Navega a la vista de productos filtrados por marca
   */
  navigateToBrand(brand: Brand): void {
    if (brand?.name) {
      this.router.navigate([`/brands`, brand.name]);
    }
  }

  onRequestBrand(): void {
    this.showOtherBrand.emit();
  }
}
