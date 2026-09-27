import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Budget } from '../models/budget';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BudgetService {
   private readonly apiUrl = `${environment.apiUrl}/api/budgets`;

  constructor(private http: HttpClient) {}

  getBudgets(): Observable<Budget[]> {
    return this.http.get<Budget[]>(this.apiUrl);
  }

  getBudget(id: number): Observable<Budget> {
    return this.http.get<Budget>(
      `${this.apiUrl}/${id}`
    );
  }

  createBudget(data: {
    name: string;
    amount: number;
    month: number;
    year: number;
  }): Observable<Budget> {
    return this.http.post<Budget>(
      this.apiUrl,
      data
    );
  }

  updateBudget(
    id: number,
    data: {
      name: string;
      amount: number;
      month: number;
      year: number;
    }
  ): Observable<Budget> {
    return this.http.put<Budget>(
      `${this.apiUrl}/${id}`,
      data
    );
  }

  deleteBudget(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }
}
