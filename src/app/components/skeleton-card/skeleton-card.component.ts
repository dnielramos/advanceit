import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-4">
      <div *ngFor="let item of items" 
        class="bg-white rounded-lg shadow-sm p-4 animate-pulse">
        <!-- Header section -->
        <div class="flex items-center justify-between mb-3">
          <div class="flex-1">
            <div class="h-5 bg-gradient-to-r from-purple-200 to-purple-100 rounded w-32 mb-2"></div>
            <div class="h-4 bg-gradient-to-r from-gray-200 to-gray-100 rounded w-48"></div>
          </div>
          <div class="h-8 w-24 bg-gradient-to-r from-purple-200 to-purple-100 rounded-full"></div>
        </div>
        
        <!-- Content section -->
        <div class="space-y-2">
          <div class="h-3 bg-gradient-to-r from-gray-200 to-gray-100 rounded w-full"></div>
          <div class="h-3 bg-gradient-to-r from-gray-200 to-gray-100 rounded w-3/4"></div>
        </div>
        
        <!-- Footer section -->
        <div class="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <div class="flex gap-2">
            <div class="h-8 w-8 bg-gradient-to-r from-purple-200 to-purple-100 rounded-full"></div>
            <div class="h-8 w-8 bg-gradient-to-r from-purple-200 to-purple-100 rounded-full"></div>
          </div>
          <div class="h-6 w-20 bg-gradient-to-r from-gray-200 to-gray-100 rounded"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes shimmer {
      0% {
        background-position: -1000px 0;
      }
      100% {
        background-position: 1000px 0;
      }
    }

    .animate-pulse {
      animation: shimmer 2s infinite linear;
      background-size: 1000px 100%;
    }

    .animate-pulse > * {
      animation: shimmer 2s infinite linear;
      background-size: 1000px 100%;
    }
  `]
})
export class SkeletonCardComponent {
  @Input() count: number = 3;
  
  get items(): number[] {
    return Array(this.count).fill(0);
  }
}
