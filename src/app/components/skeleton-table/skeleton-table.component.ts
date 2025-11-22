import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="border border-gray-200 rounded-lg overflow-hidden">
      <table class="w-full">
        <!-- Header -->
        <thead class="bg-gradient-to-r from-purple-600 to-purple-700">
          <tr>
            <th *ngFor="let col of columns" class="px-6 py-4">
              <div class="h-4 bg-purple-500 rounded w-24"></div>
            </th>
          </tr>
        </thead>
        
        <!-- Body -->
        <tbody class="divide-y divide-gray-200">
          <tr *ngFor="let row of rows; let odd = odd" 
            [class]="odd ? 'bg-white' : 'bg-gray-50'"
            class="animate-pulse">
            <td *ngFor="let col of columns" class="px-6 py-4">
              <div class="h-4 bg-gradient-to-r from-gray-200 to-gray-100 rounded" 
                [style.width.%]="getRandomWidth()"></div>
            </td>
          </tr>
        </tbody>
      </table>
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

    .animate-pulse > td > div {
      animation: shimmer 2s infinite linear;
      background-size: 1000px 100%;
    }
  `]
})
export class SkeletonTableComponent {
  @Input() rowCount: number = 5;
  @Input() columnCount: number = 5;
  
  get rows(): number[] {
    return Array(this.rowCount).fill(0);
  }
  
  get columns(): number[] {
    return Array(this.columnCount).fill(0);
  }
  
  getRandomWidth(): number {
    return Math.floor(Math.random() * 30) + 60; // 60-90%
  }
}
