import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, shareReplay, tap } from 'rxjs';

import { Budget } from '../models/budget';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BudgetService {

  private readonly apiUrl = `${environment.apiUrl}/api/budgets`;

  private budgets$?: Observable<Budget[]>;

  constructor(private http: HttpClient) {}

  getBudgets(): Observable<Budget[]> {

    if (!this.budgets$) {

      this.budgets$ = this.http
        .get<Budget[]>(this.apiUrl)
        .pipe(
          shareReplay(1)
        );
    }

    return this.budgets$;
  }
  refreshBudgets(): void {
  this.budgets$ = undefined;
}

  getBudget(id: number): Observable<Budget> {
    return this.http.get<Budget>(`${this.apiUrl}/${id}`);
  }

  createBudget(
    data: {
      name: string;
      amount: number;
      month: number;
      year: number;
    }
  ): Observable<Budget> {

    return this.http
      .post<Budget>(this.apiUrl, data)
      .pipe(
        tap(() => {
          this.budgets$ = undefined;
        })
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

    return this.http
      .put<Budget>(`${this.apiUrl}/${id}`, data)
      .pipe(
        tap(() => {
          this.budgets$ = undefined;
        })
      );
  }

  deleteBudget(id: number): Observable<void> {

    return this.http
      .delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        tap(() => {
          this.budgets$ = undefined;
        })
      );
  }
}