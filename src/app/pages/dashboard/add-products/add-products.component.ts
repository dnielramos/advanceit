// home.component.ts
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  imports : [CommonModule],
  templateUrl: './add-products.component.html',
  standalone: true
})
export class AddProductsComponent {
  featuredCategories = [
    { name: 'Cloud Solutions', icon: '☁️' },
    { name: 'Hardware', icon: '💻' },
    { name: 'Networking', icon: '📡' },
    { name: 'Storage', icon: '💾' }
  ];

  featuredProducts = [
    { name: 'Quantum Server', price: '$1,499', image: 'server.jpg' },
    { name: 'AI Workstation', price: '$2,899', image: 'workstation.jpg' },
    { name: 'Edge Router', price: '$499', image: 'router.jpg' },
    { name: 'Quantum Drive', price: '$299', image: 'drive.jpg' }
  ];
}
