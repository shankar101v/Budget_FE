import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Budget } from '../../../models/budget';
import { Transaction } from '../../../models/transaction';

import { BudgetService } from '../../../services/budget.service';
import { TransactionService } from '../../../services/transaction.service';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-budget-detail',
  standalone: true,
  imports: [RouterLink, ConfirmDialog],
  templateUrl: './budget-detail.html',
  styleUrl: './budget-detail.css'
})
export class BudgetDetail implements OnInit {

  budget: Budget | null = null;

  transactions: Transaction[] = [];

  isLoading = true;
  isTransactionsLoading = true;

  errorMessage = '';

  showDeleteDialog = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private budgetService: BudgetService,
    private transactionService: TransactionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    const id = Number(
      this.route.snapshot.paramMap.get('id')
    );

    if (!id) {

      this.errorMessage = 'Invalid budget ID.';
      this.isLoading = false;

      this.cdr.detectChanges();

      return;
    }

    this.loadBudget(id);
    this.loadTransactions(id);
  }

  loadBudget(id: number): void {

    this.budgetService.getBudget(id).subscribe({

      next: (budget) => {
        this.budget = budget;
        this.isLoading = false;

        this.cdr.detectChanges();
      },

      error: (error) => {

        console.error(
          'Error loading budget:',
          error
        );

        this.isLoading = false;

        if (error.status === 401) {

          this.errorMessage =
            'You are not authorized.';

        } else if (error.status === 404) {

          this.errorMessage =
            'Budget not found.';

        } else {

          this.errorMessage =
            'Unable to load budget.';

        }

        this.cdr.detectChanges();
      }

    });
  }

  loadTransactions(budgetId: number): void {

    this.transactionService.getTransactions().subscribe({

      next: (transactions) => {
        this.transactions = transactions.filter(
          transaction =>
            transaction.budgetId === budgetId
        );

        this.isTransactionsLoading = false;

        this.cdr.detectChanges();
      },

      error: (error) => {

        console.error(
          'Error loading transactions:',
          error
        );

        this.isTransactionsLoading = false;

        this.cdr.detectChanges();
      }

    });
  }

  deleteTransaction(transaction: Transaction): void {

    const confirmed = confirm(
      'Are you sure you want to delete this transaction?'
    );

    if (!confirmed) {
      return;
    }

    this.transactionService
      .deleteTransaction(transaction.id)
      .subscribe({

        next: () => {
          if (this.budget) {
            this.loadBudget(this.budget.id);
            this.loadTransactions(this.budget.id);
          }

        },

        error: (error) => {

          console.error(
            'Error deleting transaction:',
            error
          );

          if (error.status === 401) {

            this.errorMessage =
              'You are not authorized.';

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

  deleteBudget(): void {

    if (!this.budget) {
      return;
    }
    this.showDeleteDialog = true;
  }
  confirmDeleteBudget(): void {

  if (!this.budget) {
    return;
  }

  const budgetId = this.budget.id;

  this.budgetService
    .deleteBudget(budgetId)
    .subscribe({

      next: () => {
        this.router.navigate(['/budgets']);
      },

      error: (error) => {

        console.error(
          'Error deleting budget:',
          error
        );

        this.showDeleteDialog = false;

        if (error.status === 401) {

          this.errorMessage =
            'You are not authorized.';

        } else if (error.status === 404) {

          this.errorMessage =
            'Budget not found.';

        } else {

          this.errorMessage =
            'Unable to delete budget.';
        }

        this.cdr.detectChanges();
      }

    });
}

cancelDeleteBudget(): void {

  this.showDeleteDialog = false;
}

}