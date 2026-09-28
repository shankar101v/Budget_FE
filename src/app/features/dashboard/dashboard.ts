import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Budget } from '../../models/budget';
import { BudgetService } from '../../services/budget.service';
import { CommonModule } from '@angular/common';
import { LoadingSpinner } from '../../shared/components/loading-spinner/loading-spinner';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink , CommonModule, LoadingSpinner],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  budgets: Budget[] = [];

  isLoading = true;
  errorMessage = '';

  totalBudgets = 0;
  totalBudgetAmount = 0;
  totalSpent = 0;
  totalRemaining = 0;

  constructor(
    private budgetService: BudgetService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.budgetService.getBudgets().subscribe({
      next: (budgets) => {

        this.budgets = budgets;

        this.totalBudgets = budgets.length;

        this.totalBudgetAmount = budgets.reduce(
          (total, budget) => total + budget.amount,
          0
        );

        this.totalSpent = budgets.reduce(
          (total, budget) => total + budget.spentAmount,
          0
        );

        this.totalRemaining = budgets.reduce(
          (total, budget) => total + budget.remainingAmount,
          0
        );

        this.isLoading = false;

        this.cdr.detectChanges();
      },

      error: (error) => {

        console.error('Dashboard error:', error);

        this.isLoading = false;

        if (error.status === 401) {
          this.errorMessage =
            'Your session has expired. Please login again.';
        } else {
          this.errorMessage =
            'Unable to load dashboard data.';
        }

        this.cdr.detectChanges();
      }
    });
  }

  getAlertMessage(budget: Budget): string {

    if (budget.percentageSpent >= 100) {
      return 'Budget exceeded';
    }

    if (budget.percentageSpent >= 90) {
      return 'Almost fully spent';
    }

    if (budget.percentageSpent >= 75) {
      return 'High spending';
    }

    if (budget.percentageSpent >= 50) {
      return 'More than half spent';
    }

    return '';
  }

  getProgressWidth(budget: Budget): number {
    return Math.min(budget.percentageSpent, 100);
  }
}