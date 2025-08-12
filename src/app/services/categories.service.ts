import { Injectable, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CategoryResponse } from './product.service';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService implements OnInit {
  private apiUrl = 'http://localhost:3002/categories'; // Cambia la URL por la de tu API

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getAllCategories();
  }

  getAllCategories(): Observable<CategoryResponse> {
    return this.http.get<CategoryResponse>(this.apiUrl);
  }
}
