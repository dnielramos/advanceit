import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router'; // Importa el Router
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronRight, faArrowLeft, faCopyright } from '@fortawesome/free-solid-svg-icons';
import { CategoriesService } from '../../../services/categories.service';
import { GroupedCategory } from '../../../services/categories.service';

@Component({
  selector: 'app-category-menu',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './category.component.html',
  styles: [`.font-sans { font-family: 'Inter', sans-serif; }`]
})
export class CategoryMenuComponent implements OnInit {
  // Íconos FontAwesome
  faChevronRight = faChevronRight;
  faArrowLeft = faArrowLeft;
  faCopyright = faCopyright;

  // Estado del componente
  categories: GroupedCategory[] = [];
  currentCategory: GroupedCategory | null = null;

  // Inyecta el Router en el constructor
  constructor(
    private categoryService: CategoriesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.categoryService.categorias$.subscribe(cats => {
      this.categories = cats;
    });
  }

  /**
   * Devuelve la categoría actualmente seleccionada.
   */
  selectedCategory(): GroupedCategory | null {
    return this.currentCategory;
  }

  /**
   * Selecciona una categoría. Si no tiene subcategorías, navega directamente.
   * Si las tiene, muestra la vista de subcategorías.
   */
  selectCategory(category: GroupedCategory): void {
    // Si no hay subcategorías o el array está vacío, navega directamente.
    if (!category.subCategories || category.subCategories.length === 0) {
      this.navigateToCategory(category.category);
    } else {
      // De lo contrario, muestra la vista de subcategorías.
      this.currentCategory = category;
    }
  }

  /**
   * Limpia la selección y vuelve a la lista principal de categorías.
   */
  goBack(): void {
    this.currentCategory = null;
  }

  /**
   * Navega a la vista de productos para una categoría o subcategoría específica.
   * @param categoryName El nombre de la categoría o subcategoría.
   */
  navigateToCategory(categoryName: string): void {
    if (categoryName) {
      // Navega a la ruta, por ejemplo: /categorias/Laptops
      this.router.navigate([`/categorias/${this.currentCategory?.category}`, categoryName]);
    }
  }
}
