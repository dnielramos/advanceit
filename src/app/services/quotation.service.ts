import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface QuotationDetail {
  id: string;
  productId: string;
  quantity: number;
  price: number;
}

export interface Quotation {
  id: string;
  clientName: string;
  total: number;
  expirationDate: string;
  details: QuotationDetail[];
}

@Injectable({
  providedIn: 'root',
})
export class QuotationService {
  private http = inject(HttpClient);
  private API_URL = 'http://localhost:3002/quotations'; // ✅ cambia por tu backend real

  getAll(): Observable<Quotation[]> {
    return this.http.get<Quotation[]>(this.API_URL);
  }

  getById(id: string): Observable<Quotation> {
    return this.http.get<Quotation>(`${this.API_URL}/${id}`);
  }

  create(quotation: Partial<Quotation>): Observable<Quotation> {
    return this.http.post<Quotation>(this.API_URL, quotation);
  }

  update(id: string, quotation: Partial<Quotation>): Observable<Quotation> {
    return this.http.patch<Quotation>(`${this.API_URL}/${id}`, quotation);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
