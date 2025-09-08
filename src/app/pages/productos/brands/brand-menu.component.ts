import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons/faChevronRight';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons/faArrowLeft';
import { faCopyright } from '@fortawesome/free-solid-svg-icons/faCopyright';
import { faTags } from '@fortawesome/free-solid-svg-icons/faTags';
import { faLayerGroup } from '@fortawesome/free-solid-svg-icons/faLayerGroup';
import { faStar } from '@fortawesome/free-solid-svg-icons/faStar';

// --- Importa tus servicios ---
import { CategoriesService, GroupedCategory } from '../../../services/categories.service';
import { BrandsService, Brand } from '../../../services/brands.service';

@Component({
  selector: 'app-brand-menu',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './brand-menu.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BrandMenuComponent implements OnInit {
  // --- Iconos ---
  faChevronRight = faChevronRight;
  faArrowLeft = faArrowLeft;
  faCopyright = faCopyright;
  faTags = faTags;
  faLayerGroup = faLayerGroup;
  faStar = faStar;

  // --- Estado del Componente ---
  activeView = signal<'categories' | 'brands'>('categories');
  categories = signal<GroupedCategory[]>([]);
  brands = signal<Brand[]>([]);
  currentCategory = signal<GroupedCategory | null>(null);

  @Output() showOtherBrand = new EventEmitter<void>();

  constructor(
    private categoryService: CategoriesService,
    private brandsService: BrandsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Carga los datos de ambos servicios
    this.categoryService.categorias$.subscribe(cats => this.categories.set(cats));
    this.brandsService.brands$.subscribe(b => this.brands.set(b));
  }

  /**
   * Cambia la vista activa entre 'categories' y 'brands'.
   * Resetea la selección de categoría al cambiar.
   */
  setActiveView(view: 'categories' | 'brands'): void {
    this.activeView.set(view);
    this.currentCategory.set(null); // Vuelve a la lista principal de categorías
  }

  // --- Métodos de Categorías ---

  /**
   * Selecciona una categoría. Si no tiene subcategorías, navega directamente.
   * Si las tiene, muestra la vista de subcategorías.
   */
  selectCategory(category: GroupedCategory): void {
    if (!category.subCategories || category.subCategories.length === 0) {
      this.navigateToProducts({ category: category.category });
    } else {
      this.currentCategory.set(category);
    }
  }

  /**
   * Limpia la selección y vuelve a la lista principal de categorías.
   */
  goBack(): void {
    this.currentCategory.set(null);
  }

  // --- Lógica de Navegación Unificada ---

  /**
   * Navega a una vista de productos aplicando filtros como query params.
   * Esta es la forma más flexible y escalable.
   * Ejemplos de navegación:
   * /productos?category=Laptops
   * /productos?category=Laptops&subcategory=Gaming
   * /productos?brand=Dell
   * /productos?category=Monitores&brand=Samsung
   * @param filters Un objeto con los filtros a aplicar.
   */
  navigateToProducts(filters: { [key: string]: string | null }): void {
    // Limpia los filtros nulos o vacíos antes de navegar
    const cleanFilters: { [key: string]: string } = {};
    for (const key in filters) {
        if (filters[key]) {
            cleanFilters[key] = filters[key] as string;
        }
    }
    this.router.navigate(['/filter-products'], { queryParams: cleanFilters });
  }

  /**
   * Wrapper para navegar a una categoría.
   */
  onSelectCategory(categoryName: string): void {
    this.navigateToProducts({ category: categoryName });
  }

  /**
   * Wrapper para navegar a una subcategoría.
   */
  onSelectSubcategory(subcategoryName: string): void {
    const parentCategory = this.currentCategory();
    if (parentCategory) {
        this.navigateToProducts({ category: parentCategory.category, subcategory: subcategoryName });
    }
  }
  
  /**
   * Wrapper para navegar a una marca.
   */
  onSelectBrand(brandName: string): void {
    this.navigateToProducts({ brand: brandName });
  }

  /**
   * Emite el evento para solicitar una marca no listada.
   */
  onRequestBrand(): void {
    this.showOtherBrand.emit();
  }
}

