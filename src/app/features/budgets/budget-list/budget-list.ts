import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BudgetService } from '../../../services/budget.service';
import { Budget } from '../../../models/budget';
import { DecimalPipe } from '@angular/common';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';


@Component({
  selector: 'app-budget-list',
  standalone: true,
  imports: [RouterLink, DecimalPipe,LoadingSpinner],
  templateUrl: './budget-list.html',
  styleUrl: './budget-list.css'
})
export class BudgetList implements OnInit {

  budgets: Budget[] = [];

  isLoading = true;
  errorMessage = '';

  constructor(
    private budgetService: BudgetService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadBudgets();
  }

  // loadBudgets(): void {

  //   this.isLoading = true;
  //   this.errorMessage = '';

  //   this.budgetService.getBudgets().subscribe({
  //     next: (budgets) => {
  //       this.budgets = budgets;
  //       this.isLoading = false;
  //     },

  //     error: (error) => {
  //       this.isLoading = false;

  //       if (error.status === 401) {
  //         this.errorMessage = 'Your session has expired. Please login again.';
  //       } else {
  //         this.errorMessage =
  //           'Unable to load budgets. Please try again.';
  //       }
  //     }
  //   });
  // }
  loadBudgets(): void {
  this.isLoading = true;
  this.errorMessage = '';
  this.budgetService.getBudgets().subscribe({

    next: (budgets) => {
      this.budgets = budgets;
      this.isLoading = false;

      // Tell Angular to refresh the template
      this.cdr.detectChanges();
    },

    error: (error) => {

      console.error('ERROR from API:', error);

      this.isLoading = false;

      if (error.status === 401) {
        this.errorMessage =
          'Your session has expired. Please login again.';
      } else {
        this.errorMessage =
          'Unable to load budgets. Please try again.';
      }

      // Tell Angular to refresh the template
      this.cdr.detectChanges();
    },

    complete: () => {
      console.log('7. Observable completed');
    }

  });
}
}