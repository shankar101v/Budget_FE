import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Transaction } from '../../../models/transaction';
import { Budget } from '../../../models/budget';

import { TransactionService } from '../../../services/transaction.service';
import { BudgetService } from '../../../services/budget.service';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { CommonModule } from '@angular/common';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [RouterLink, ConfirmDialog, CommonModule, LoadingSpinner],
  templateUrl: './transaction-list.html',
  styleUrl: './transaction-list.css'
})
export class TransactionList implements OnInit {

  transactions: Transaction[] = [];
  budgets: Budget[] = [];

  isLoading = true;
  errorMessage = '';

  showDeleteDialog = false;
  transactionToDelete: Transaction | null = null;

  constructor(
    private transactionService: TransactionService,
    private budgetService: BudgetService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {

    this.isLoading = true;
    this.errorMessage = '';

    this.budgetService.getBudgets().subscribe({
      next: (budgets) => {
        this.budgets = budgets;

        this.loadTransactions();
      },

      error: (error) => {

        console.error('Error loading budgets:', error);

        this.isLoading = false;

        if (error.status === 401) {
          this.errorMessage =
            'Your session has expired. Please login again.';
        } else {
          this.errorMessage =
            'Unable to load budgets.';
        }

        this.cdr.detectChanges();
      }
    });
  }

  loadTransactions(): void {

    this.transactionService.getTransactions().subscribe({
      next: (transactions) => {
        this.transactions = transactions;

        this.isLoading = false;

        this.cdr.detectChanges();
      },

      error: (error) => {

        console.error('Error loading transactions:', error);

        this.isLoading = false;

        if (error.status === 401) {
          this.errorMessage =
            'Your session has expired. Please login again.';
        } else {
          this.errorMessage =
            'Unable to load transactions.';
        }

        this.cdr.detectChanges();
      }
    });
  }

  getBudgetName(budgetId: number | undefined): string {

    if (!budgetId) {
      return 'Unknown';
    }

    const budget = this.budgets.find(
      budget => budget.id === budgetId
    );

    return budget ? budget.name : 'Unknown';
  }

  deleteTransaction(transaction: Transaction): void {

    this.transactionToDelete = transaction;

    this.showDeleteDialog = true;

  }

  confirmDeleteTransaction(): void {

  if (!this.transactionToDelete) {
    return;
  }

  const transactionId = this.transactionToDelete.id;

  this.transactionService
    .deleteTransaction(transactionId)
    .subscribe({

      next: () => {
        this.showDeleteDialog = false;
        this.transactionToDelete = null;

        this.loadData();
      },

      error: (error) => {

        console.error(
          'Error deleting transaction:',
          error
        );

        this.showDeleteDialog = false;
        this.transactionToDelete = null;

        if (error.status === 401) {

          this.errorMessage =
            'Your session has expired. Please login again.';

        } else if (error.status === 404) {

          this.errorMessage =
            'Transaction not found.';

        } else {

          this.errorMessage =
            'Unable to delete transaction.';

        }

        this.cdr.detectChanges();
      }

    });
}

cancelDelete(): void {

  this.showDeleteDialog = false;

  this.transactionToDelete = null;
}
}