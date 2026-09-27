import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Transaction } from '../models/transaction';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {

  private apiUrl = 'https://budget-be-demo.vercel.app/api';

  constructor(private http: HttpClient) {}

  getTransactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(
      `${this.apiUrl}/transactions`
    );
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
    return this.http.post<Transaction>(
      `${this.apiUrl}/budgets/${budgetId}/transactions`,
      data
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
    return this.http.put<Transaction>(
      `${this.apiUrl}/transactions/${id}`,
      data
    );
  }

  deleteTransaction(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/transactions/${id}`
    );
  }
}