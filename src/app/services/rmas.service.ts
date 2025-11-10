import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENVIRONMENT } from '../../enviroments/enviroment';
import { Rma, CreateRmaDto, UpdateRmaDataDto } from '../models/rma.model';

@Injectable({
  providedIn: 'root'
})
export class RmasService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${ENVIRONMENT.apiUrl}/rmas`;

  findAllRmas(): Observable<{ total: number; data: Rma[] }> {
    return this.http.get<{ total: number; data: Rma[] }>(this.apiUrl);
  }

  findRmaById(id: string): Observable<{ data: Rma }> {
    return this.http.get<{ data: Rma }>(`${this.apiUrl}/${id}`);
  }

  createRma(body: CreateRmaDto): Observable<{ message: string; data: Rma }> {
    return this.http.post<{ message: string; data: Rma }>(this.apiUrl, body);
  }

  updateRmaState(
    id: string,
    nextState: string,
    notas?: string,
  ): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.apiUrl}/${id}/state`, {
      nextState,
      notas,
    });
  }

  updateRmaData(
    id: string,
    body: UpdateRmaDataDto,
  ): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.apiUrl}/${id}`, body);
  }

  deleteRma(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}
