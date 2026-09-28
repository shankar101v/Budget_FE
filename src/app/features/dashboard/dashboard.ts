import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

import { Budget } from '../../models/budget';
import { Transaction } from '../../models/transaction';
import { BudgetService } from '../../services/budget.service';
import { TransactionService } from '../../services/transaction.service';
import { LoadingSpinner } from '../../shared/components/loading-spinner/loading-spinner';

interface SpendingCategory {
  name: string;
  amount: number;
  percentage: number;
  colorClass: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, CommonModule, LoadingSpinner],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  budgets: Budget[] = [];
  transactions: Transaction[] = [];

  filteredBudgets: Budget[] = [];
  filteredTransactions: Transaction[] = [];

  spendingCategories: SpendingCategory[] = [];

  isLoading = true;
  errorMessage = '';

  totalBudgets = 0;
  totalBudgetAmount = 0;
  totalSpent = 0;
  totalRemaining = 0;
  totalTransactions = 0;

  selectedMonth = new Date().getMonth() + 1;
  selectedYear = new Date().getFullYear();

  availablePeriods: { month: number; year: number }[] = [];

  readonly categoryColors = [
    'category-blue',
    'category-green',
    'category-orange',
    'category-purple',
    'category-pink',
    'category-cyan'
  ];

  constructor(
    private budgetService: BudgetService,
    private transactionService: TransactionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.isLoading = true;
    this.errorMessage = '';

    let budgetsLoaded = false;
    let transactionsLoaded = false;

    this.budgetService.getBudgets().subscribe({
      next: (budgets) => {
        this.budgets = budgets;
        budgetsLoaded = true;

        this.buildAvailablePeriods();
        this.setInitialPeriod();
        this.updateDashboardData();

        if (transactionsLoaded) {
          this.finishLoading();
        }
      },

      error: (error) => {
        console.error('Dashboard budget error:', error);
        this.handleError(error);
      }
    });

    this.transactionService.getTransactions().subscribe({
      next: (transactions) => {
        this.transactions = transactions;
        transactionsLoaded = true;

        this.updateDashboardData();

        if (budgetsLoaded) {
          this.finishLoading();
        }
      },

      error: (error) => {
        console.error('Dashboard transaction error:', error);

        // Budget information can still be displayed
        // even if transactions fail to load.
        transactionsLoaded = true;

        if (budgetsLoaded) {
          this.errorMessage = 'Unable to load recent transaction data.';
          this.finishLoading();
        } else {
          this.handleError(error);
        }
      }
    });
  }

  private finishLoading(): void {
    this.isLoading = false;
    this.cdr.detectChanges();
  }

  private handleError(error: any): void {
    this.isLoading = false;

    if (error?.status === 401) {
      this.errorMessage =
        'Your session has expired. Please login again.';
    } else {
      this.errorMessage =
        'Unable to load dashboard data.';
    }

    this.cdr.detectChanges();
  }

  private buildAvailablePeriods(): void {
    const periods = this.budgets.map(budget => ({
      month: budget.month,
      year: budget.year
    }));

    const uniquePeriods = new Map<string, { month: number; year: number }>();

    periods.forEach(period => {
      const key = `${period.year}-${period.month}`;

      if (!uniquePeriods.has(key)) {
        uniquePeriods.set(key, period);
      }
    });

    this.availablePeriods = Array.from(uniquePeriods.values())
      .sort((a, b) => {
        if (a.year !== b.year) {
          return b.year - a.year;
        }

        return b.month - a.month;
      });
  }

  private setInitialPeriod(): void {
    const currentPeriodExists = this.availablePeriods.some(
      period =>
        period.month === this.selectedMonth &&
        period.year === this.selectedYear
    );

    if (!currentPeriodExists && this.availablePeriods.length > 0) {
      this.selectedMonth = this.availablePeriods[0].month;
      this.selectedYear = this.availablePeriods[0].year;
    }
  }

  onPeriodChange(): void {
    this.updateDashboardData();
  }

  private updateDashboardData(): void {
    this.filteredBudgets = this.budgets.filter(
      budget =>
        budget.month === this.selectedMonth &&
        budget.year === this.selectedYear
    );

    this.filteredTransactions = this.transactions.filter(transaction => {
      const date = new Date(transaction.transactionDate);

      return (
        date.getMonth() + 1 === this.selectedMonth &&
        date.getFullYear() === this.selectedYear
      );
    });

    this.totalBudgets = this.filteredBudgets.length;

    this.totalBudgetAmount = this.filteredBudgets.reduce(
      (total, budget) => total + budget.amount,
      0
    );

    this.totalSpent = this.filteredBudgets.reduce(
      (total, budget) => total + budget.spentAmount,
      0
    );

    this.totalRemaining = this.filteredBudgets.reduce(
      (total, budget) => total + budget.remainingAmount,
      0
    );

    this.totalTransactions = this.filteredTransactions.length;

    this.buildSpendingCategories();
  }

  private buildSpendingCategories(): void {
    const total = this.totalSpent;

    this.spendingCategories = this.filteredBudgets
      .filter(budget => budget.spentAmount > 0)
      .map((budget, index) => ({
        name: budget.name,
        amount: budget.spentAmount,
        percentage: total > 0
          ? (budget.spentAmount / total) * 100
          : 0,
        colorClass:
          this.categoryColors[index % this.categoryColors.length]
      }));
  }

  getChartBackground(): string {
    if (this.spendingCategories.length === 0) {
      return 'conic-gradient(#E2E8F0 0deg 360deg)';
    }

    let currentDegree = 0;

    const segments = this.spendingCategories.map(category => {
      const start = currentDegree;
      const end = currentDegree + (category.percentage * 3.6);

      currentDegree = end;

      return `${this.getCategoryColor(category.colorClass)} ${start}deg ${end}deg`;
    });

    return `conic-gradient(${segments.join(', ')})`;
  }

  private getCategoryColor(colorClass: string): string {
    const colors: Record<string, string> = {
      'category-blue': '#2563EB',
      'category-green': '#10B981',
      'category-orange': '#F59E0B',
      'category-purple': '#7C3AED',
      'category-pink': '#EC4899',
      'category-cyan': '#06B6D4'
    };

    return colors[colorClass] ?? '#4F46E5';
  }

  getRecentTransactions(): Transaction[] {
    return [...this.filteredTransactions]
      .sort(
        (a, b) =>
          new Date(b.transactionDate).getTime() -
          new Date(a.transactionDate).getTime()
      )
      .slice(0, 5);
  }

  getTransactionBudgetName(transaction: Transaction): string {
    if (!transaction.budgetId) {
      return 'Other';
    }

    const budget = this.filteredBudgets.find(
      item => item.id === transaction.budgetId
    );

    return budget?.name ?? 'Other';
  }

  getTransactionInitial(transaction: Transaction): string {
    const name = this.getTransactionBudgetName(transaction);

    return name.charAt(0).toUpperCase();
  }

  getTransactionDateLabel(transaction: Transaction): string {
    const date = new Date(transaction.transactionDate);

    const today = new Date();

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }

    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short'
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

  getMonthName(month: number): string {
    return new Date(2000, month - 1, 1).toLocaleString(
      'en-US',
      { month: 'long' }
    );
  }

  trackByCategory(_: number, category: SpendingCategory): string {
    return category.name;
  }
}