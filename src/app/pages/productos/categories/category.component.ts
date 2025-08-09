import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronRight, faArrowLeft, faCopyright } from '@fortawesome/free-solid-svg-icons';
import { ProductsService, GroupedCategory, CategoryResponse } from '../../../services/product.service';

@Component({
  selector: 'app-category-menu',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  template: `
<div class="w-80 h-[100dvh] bg-white shadow-xl rounded-lg overflow-hidden font-sans">
  <!-- Logo -->
  <div class="flex p-4 items-center border-b">
    <img src="logo.png" alt="Advance Technology Projects" class="h-10" />
  </div>

  <div class="relative w-full h-[calc(100vh-70px)]">
    <!-- Categories View -->
    <div class="absolute w-full h-full p-4 overflow-y-auto transition-transform duration-300 ease-in-out"
         [ngClass]="{
           '-translate-x-full opacity-0': selectedCategory(),
           'translate-x-0 opacity-100': !selectedCategory()
         }">
      <h2 class="text-xl font-bold text-purple-700 mb-4">Categorias</h2>
      <ul class="space-y-3">
        <li *ngFor="let category of categories"
            class="flex items-center justify-between p-3 bg-gray-50 hover:bg-purple-100 rounded-lg cursor-pointer transition-colors"
            (click)="selectCategory(category)">
          <span class="flex items-center font-medium text-gray-800">
            <fa-icon [icon]="faCopyright" class="mr-3 text-purple-600"></fa-icon>
            {{ category.category }}
          </span>
          <fa-icon [icon]="faChevronRight" class="text-gray-400"></fa-icon>
        </li>
      </ul>
    </div>

    <!-- Subcategories View -->
    <div *ngIf="selectedCategory()"
         class="absolute w-full h-full p-4 overflow-y-auto transition-transform duration-300 ease-in-out"
         [ngClass]="{
           'translate-x-0 opacity-100': selectedCategory(),
           'translate-x-full opacity-0': !selectedCategory()
         }">
      <button (click)="goBack()"
              class="mb-4 flex items-center text-purple-600 hover:text-purple-800 font-semibold">
        <fa-icon [icon]="faArrowLeft" class="mr-2"></fa-icon>
        Volver
      </button>
      <h2 class="text-xl font-bold text-purple-700 mb-4">{{ selectedCategory()?.category }}</h2>
      <ul class="space-y-2">
        <li *ngIf="!selectedCategory()?.subCategories?.length"
            class="p-2 text-gray-500">
          No subcategories available.
        </li>
        <li *ngFor="let sub of selectedCategory()?.subCategories"
            class="p-3 bg-gray-50 hover:bg-purple-100 rounded-lg cursor-pointer transition-colors text-gray-700">
          {{ sub }}
        </li>
      </ul>
    </div>
  </div>
</div>
  `,
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

  constructor(private categoryService: ProductsService) {}

  ngOnInit(): void {
    this.getCategories();
  }

  /**
   * Obtiene las categorías desde el servicio.
   */
  getCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (response: CategoryResponse) => {
        this.categories = response.catalog;
      },
      error: (err) => {
        console.error('Error fetching categories:', err);
        this.categories = [];
      }
    });
  }

  /**
   * Devuelve la categoría actualmente seleccionada.
   */
  selectedCategory(): GroupedCategory | null {
    return this.currentCategory;
  }

  /**
   * Selecciona una categoría para mostrar sus subcategorías.
   */
  selectCategory(category: GroupedCategory): void {
    this.currentCategory = category;
  }

  /**
   * Limpia la selección y vuelve a la lista principal.
   */
  goBack(): void {
    this.currentCategory = null;
  }
}
