/*==================================*/
/*   LAYOUT COMPONENT (dashboard-layout.component.ts)   */
/*==================================*/
import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../components/dashboard/sidebar/sidebar.component';
import { TopbarComponent } from '../../components/dashboard/topbar/topbar.component';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, TopbarComponent],
  template: `
    <div class="bg-gray-100 h-screen lg:flex">
      <!-- SIDEBAR -->
      <aside
        class="fixed inset-y-0 left-0 z-20 w-48 bg-white shadow-lg transform transition-transform duration-300
           lg:translate-x-0 lg:static lg:inset-auto"
        [ngClass]="{
          '-translate-x-full': !sidebarOpen,
          'translate-x-0': sidebarOpen
        }"
      >
        <app-sidebar
          #sidebar
          (changeWithSideBar)="toggleSidebarDesktop()"
          [isToggleSidebarDesktop]="isToggleSidebarDesktop"
        ></app-sidebar>
      </aside>

      <!-- OVERLAY PARA MOBILE -->
      <div
        class="fixed inset-0 bg-black/50 md:hidden z-10"
        *ngIf="sidebarOpen"
        (click)="closeSidebarMobile()"
      ></div>

      <!-- CONTENIDO PRINCIPAL -->
      <div class="flex-1 flex flex-col z-0">
        <!-- TOPBAR -->
        <header class="sticky top-0 z-21 bg-white shadow-sm">
          <!-- Añadido bg-white y shadow-sm para mejor visibilidad -->
          <app-topbar
            (toggleSidebarMobile)="toggleSidebarMobile()"
            (toggleSidebarDesktop)="toggleSidebarDesktop()"
          ></app-topbar>
        </header>

        <!-- ROUTER OUTLET - CONTENIDO SCROLLABLE -->
        <main class="flex-1 overflow-y-auto">
          <!-- CLAVE: Añadido overflow-y-auto aquí -->
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [],
})
export class DashboardLayoutComponent {
  @ViewChild('sidebar') sidebarRef!: SidebarComponent;

  sidebarOpen: boolean = false;
  isToggleSidebarDesktop: boolean = false;

  toggleSidebarMobile() {
    this.sidebarOpen = !this.sidebarOpen;
    if (!this.sidebarOpen) {
      this.closeAllSubmenus();
    }
  }

  closeSidebarMobile() {
    this.sidebarOpen = false;
    this.closeAllSubmenus();
  }

  toggleSidebarDesktop() {
    this.isToggleSidebarDesktop = !this.isToggleSidebarDesktop;
    if (this.isToggleSidebarDesktop) {
      this.closeAllSubmenus();
    }
  }

  private closeAllSubmenus() {
    if (this.sidebarRef) {
      this.sidebarRef.closeAllSubmenus();
    }
  }
}
