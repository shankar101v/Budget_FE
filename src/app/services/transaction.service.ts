import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay, tap } from 'rxjs';

import { Transaction } from '../models/transaction';
import { environment } from '../../environments/environment';
import { BudgetService } from './budget.service';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {

  private apiUrl = `${environment.apiUrl}/api`;

  private transactions$?: Observable<Transaction[]>;

  constructor(private http: HttpClient, 
              private budgetService: BudgetService
  ) {}

  getTransactions(): Observable<Transaction[]> {

    if (!this.transactions$) {

      this.transactions$ = this.http
        .get<Transaction[]>(
          `${this.apiUrl}/transactions`
        )
        .pipe(
          shareReplay(1)
        );
    }

    return this.transactions$;
  }

  getTransaction(id: number): Observable<Transaction> {
    return this.http.get<Transaction>(
      `${this.apiUrl}/transactions/${id}`
    );
  }

createTransaction(
  budgetId: number,
  data: {
    amount: number;
    description?: string;
    transactionDate: string;
  }
): Observable<Transaction> {

  return this.http
    .post<Transaction>(
      `${this.apiUrl}/budgets/${budgetId}/transactions`,
      data
    )
    .pipe(
      tap(() => {
        this.transactions$ = undefined;
        this.budgetService.refreshBudgets();
      })
    );
}

updateTransaction(
  id: number,
  data: {
    amount: number;
    description?: string;
    transactionDate: string;
  }
): Observable<Transaction> {

  return this.http
    .put<Transaction>(
      `${this.apiUrl}/transactions/${id}`,
      data
    )
    .pipe(
      tap(() => {
        this.transactions$ = undefined;
        this.budgetService.refreshBudgets();
      })
    );
}

deleteTransaction(id: number): Observable<void> {

  return this.http
    .delete<void>(
      `${this.apiUrl}/transactions/${id}`
    )
    .pipe(
      tap(() => {
        this.transactions$ = undefined;
        this.budgetService.refreshBudgets();
      })
    );
}
}