// src/app/services/company-inventories.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface InventoryPayload {
  company: string;
  inventory: any[];
  created_by?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CompanyInventoriesService {
  private readonly apiUrl = 'http://localhost:3002/company-inventories';

  constructor(private http: HttpClient) {}

  // CREATE
  createInventory(payload: InventoryPayload): Observable<any> {
    return this.http.post(`${this.apiUrl}`, payload);
  }

  // READ - ALL
  getAllInventories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}`);
  }

  // READ - BY COMPANY
  getInventoryByCompany(company: string): Observable<any[]> {
    const params = new HttpParams().set('company', company);
    return this.http.get<any[]>(`${this.apiUrl}/by-company`, { params });
  }

  // READ - BY ID
  getInventoryById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // UPDATE
  updateInventory(id: string, newData: any, updatedBy: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, { newData, updatedBy });
  }

  // DELETE
  deleteInventory(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
