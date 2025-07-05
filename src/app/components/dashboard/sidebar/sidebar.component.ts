/*==================================*/
/*   SIDEBAR COMPONENT (sidebar.component.ts)   */
/*==================================*/
import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faTachometerAlt,
  faCube,
  faIcons,
  faFillDrip,
  faChartPie,
  faTable,
  faUser,
  faBook,
  faChevronDown,
  faChevronRight
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FontAwesomeModule],
  template: `
    <div
      class="h-[100dvh] transition-all flex flex-col py-2 shadow-md"
      [ngClass]="{
        'w-24': isToggleSidebarDesktop,
        'w-auto': !isToggleSidebarDesktop,
        'items-center': isToggleSidebarDesktop
      }"
      (mouseenter)="onMouseEnter()"
      (mouseleave)="onMouseLeave()"
    >
      <div
        class="flex py-2 items-center px-4 space-x-2"
        [ngClass]="{ 'opacity-0': isToggleSidebarDesktop }"
      >
        <img class="max-w-30" src="logo.png" alt="Logo" />
      </div>

      <div class="px-4 py-2 flex items-center space-x-3">
        <img
          src="https://img.freepik.com/free-photo/portrait-man-laughing_23-2148859448.jpg"
          alt="User Avatar"
          class="w-10 h-10 rounded-full"
        />
        <div class="leading-tight" *ngIf="!isToggleSidebarDesktop">
          <p class="font-semibold text-gray-600">Arturo Esguerra</p>
          <p class="text-sm text-purple-600">CEO</p>
        </div>
      </div>

      <hr class="my-2 text-gray-300" />

      <nav class="flex-1 overflow-y-auto px-2">
        <a
          routerLink="/dashboard/home"
          routerLinkActive="bg-purple-100"
          class="flex items-center space-x-2 px-3 py-2 rounded hover:bg-purple-50 transition"
        >
          <fa-icon [icon]="faTachometerAlt" class="text-gray-600"></fa-icon>
          <span *ngIf="!isToggleSidebarDesktop" class="text-gray-700 font-semibold"
            >Dashboard</span
          >
        </a>

        <div class="mt-2">
          <button
            (click)="toggleUIElements()"
            class="w-full flex items-center justify-between space-x-2 px-3 py-2 rounded hover:bg-purple-50 transition"
          >
            <div class="flex items-center space-x-2">
              <fa-icon [icon]="faCube" class="text-gray-600"></fa-icon>
              <span *ngIf="!isToggleSidebarDesktop" class="text-gray-700 font-semibold"
                >Products</span
              >
            </div>
            <fa-icon
              [icon]="uiElementsOpen ? faChevronDown : faChevronRight"
              class="text-gray-500"
            ></fa-icon>
          </button>
          <div *ngIf="uiElementsOpen" class="pl-10 flex flex-col space-y-1 mt-1">
            <a
              routerLink="/dashboard/add-ingram-products"
              routerLinkActive="text-purple-600"
              class="text-sm text-gray-600 hover:text-purple-600"
            >
              ➤ Ingram
            </a>
            <a
              routerLink="/dashboard/add-nexsys-products"
              routerLinkActive="text-purple-600"
              class="text-sm text-gray-600 hover:text-purple-600"
            >
              ➤ Nexsys
            </a>
            <!-- <a
              routerLink="/dashboard/orders"
              routerLinkActive="text-purple-600"
              class="text-sm text-gray-600 hover:text-purple-600"
            >
              ➤ Orders
            </a> -->
            <a
              routerLink="/dashboard/advance-products"
              routerLinkActive="text-purple-600"
              class="text-sm text-gray-600 hover:text-purple-600"
            >
              ➤ Database Products
            </a>
          </div>
        </div>

        <!-- <div class="mt-2">
          <button
            (click)="toggleIconsSubmenu()"
            class="w-full flex items-center justify-between space-x-2 px-3 py-2 rounded hover:bg-purple-50 transition"
          >
            <div class="flex items-center space-x-2">
              <fa-icon [icon]="faIcons" class="text-gray-600"></fa-icon>
              <span *ngIf="!isToggleSidebarDesktop" class="text-gray-700 font-semibold"
                >Marketing</span
              >
            </div>
            <fa-icon
              [icon]="iconsSubmenuOpen ? faChevronDown : faChevronRight"
              class="text-gray-500"
            ></fa-icon>
          </button>
          <div *ngIf="iconsSubmenuOpen" class="pl-10 flex flex-col space-y-1 mt-1">
            <a
              routerLink="/dashboard/icons/library"
              routerLinkActive="text-purple-600"
              class="text-sm text-gray-600 hover:text-purple-600"
            >
              ➤ Crear Campaña
            </a>
            <a
              routerLink="/dashboard/icons/custom"
              routerLinkActive="text-purple-600"
              class="text-sm text-gray-600 hover:text-purple-600"
            >
              ➤ Crear Meta
            </a>
          </div>
        </div> -->

    <!-- }}

        <a
          routerLink="/dashboard/forms"
          routerLinkActive="bg-purple-100"
          class="flex items-center space-x-2 px-3 py-2 rounded hover:bg-purple-50 transition mt-2"
        >
          <fa-icon [icon]="faFillDrip" class="text-gray-600"></fa-icon>
          <span *ngIf="!isToggleSidebarDesktop" class="text-gray-700 font-semibold"
            >Embeddings</span
          >
        </a>

        <a
          routerLink="/dashboard/charts"
          routerLinkActive="bg-purple-100"
          class="flex items-center space-x-2 px-3 py-2 rounded hover:bg-purple-50 transition"
        >
          <fa-icon [icon]="faChartPie" class="text-purple-600"></fa-icon>
          <span *ngIf="!isToggleSidebarDesktop" class="text-gray-700 font-semibold"
            >Charts</span
          >
        </a>

        <a
          routerLink="/dashboard/tables"
          routerLinkActive="bg-purple-100"
          class="flex items-center space-x-2 px-3 py-2 rounded hover:bg-purple-50 transition"
        >
          <fa-icon [icon]="faTable" class="text-purple-600"></fa-icon>
          <span *ngIf="!isToggleSidebarDesktop" class="text-gray-700 font-semibold"
            >Tables</span
          >
        </a>

        <a
          routerLink="/dashboard/user-pages"
          routerLinkActive="bg-purple-100"
          class="flex items-center space-x-2 px-3 py-2 rounded hover:bg-purple-50 transition"
        >
          <fa-icon [icon]="faUser" class="text-purple-600"></fa-icon>
          <span *ngIf="!isToggleSidebarDesktop" class="text-gray-700 font-semibold"
            >User Pages</span
          >
        </a>

        <a
          routerLink="/dashboard/docs"
          routerLinkActive="bg-purple-100"
          class="flex items-center space-x-2 px-3 py-2 rounded hover:bg-purple-50 transition"
        >
          <fa-icon [icon]="faBook" class="text-purple-600"></fa-icon>
          <span *ngIf="!isToggleSidebarDesktop" class="text-gray-700 font-semibold"
            >Documentation</span
          >
        </a> -->

      </nav>

      <div
        *ngIf="!isToggleSidebarDesktop"
        class="p-4 text-center text-sm text-gray-500"
      >
        © 2025 Advance Technologies. All rights reserved.
      </div>
    </div>
  `
  })
export class SidebarComponent {
  faTachometerAlt = faTachometerAlt;
  faCube = faCube;
  faIcons = faIcons;
  faFillDrip = faFillDrip;
  faChartPie = faChartPie;
  faTable = faTable;
  faUser = faUser;
  faBook = faBook;
  faChevronDown = faChevronDown;
  faChevronRight = faChevronRight;

  @Input() uiElementsOpen: boolean = false;
  iconsSubmenuOpen: boolean = false;

  @Input() isToggleSidebarDesktop: boolean = false;

  @Output() changeWithSideBar = new EventEmitter<void>();

  private wasCollapsedOnHover: boolean = false;

  toggleUIElements() {
    this.uiElementsOpen = !this.uiElementsOpen;
    if (this.uiElementsOpen) {
      this.iconsSubmenuOpen = false;
    }
  }

  toggleIconsSubmenu() {
    this.iconsSubmenuOpen = !this.iconsSubmenuOpen;
    if (this.iconsSubmenuOpen) {
      this.uiElementsOpen = false;
    }
  }

  onMouseEnter() {
    if (this.isToggleSidebarDesktop) {
      this.isToggleSidebarDesktop = false;
      this.wasCollapsedOnHover = true;
      this.changeWithSideBar.emit();
    }
  }

  onMouseLeave() {
    if (this.wasCollapsedOnHover) {
      this.isToggleSidebarDesktop = true;
      this.wasCollapsedOnHover = false;
      this.closeAllSubmenus();
      this.changeWithSideBar.emit();
    }
  }

  closeAllSubmenus() {
    this.uiElementsOpen = false;
    this.iconsSubmenuOpen = false;
  }
}
