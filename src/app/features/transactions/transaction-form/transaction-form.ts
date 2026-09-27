import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Budget } from '../../../models/budget';
import { TransactionRequest } from '../../../models/transaction';
import { BudgetService } from '../../../services/budget.service';
import { TransactionService } from '../../../services/transaction.service';

@Component({
  selector: 'app-transaction-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './transaction-form.html',
  styleUrl: './transaction-form.css'
})
export class TransactionForm implements OnInit {

  transactionForm;

  budgets: Budget[] = [];

  isSubmitting = false;
  isLoading = true;
  isEditMode = false;

  transactionId: number | null = null;

  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private budgetService: BudgetService,
    private transactionService: TransactionService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {

    this.transactionForm = this.fb.group({

      budgetId: this.fb.control<number | null>(
        null,
        [Validators.required]
      ),

      amount: this.fb.control<number | null>(
        null,
        [
          Validators.required,
          Validators.min(1)
        ]
      ),

      description: this.fb.control<string | null>(
        ''
      ),

      transactionDate: this.fb.control<string>(
        new Date().toISOString().split('T')[0],
        [Validators.required]
      )

    });
  }

ngOnInit(): void {

  const id = this.route.snapshot.paramMap.get('id');

  if (id) {

    this.isEditMode = true;
    this.transactionId = Number(id);

  }

  this.loadBudgets();

}

  loadBudgets(): void {

  this.budgetService.getBudgets().subscribe({

    next: (budgets) => {
      this.budgets = budgets;

      /*
       * Edit mode
       */
      if (
        this.isEditMode &&
        this.transactionId !== null
      ) {

        this.loadTransaction(
          this.transactionId
        );

        return;
      }


      /*
       * Create mode
       *
       * Check if a budgetId was passed
       * from the Budget Detail page.
       */
      const budgetId =
        this.route.snapshot.queryParamMap.get(
          'budgetId'
        );

      if (budgetId) {

        const selectedBudgetId =
          Number(budgetId);

        const budgetExists =
          this.budgets.some(
            budget => budget.id === selectedBudgetId
          );

        if (budgetExists) {

          this.transactionForm.patchValue({
            budgetId: selectedBudgetId
          });
        }

      }

      this.isLoading = false;

      this.cdr.detectChanges();

    },

    error: (error) => {

      console.error(
        'Error loading budgets:',
        error
      );

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
  loadTransaction(id: number): void {

    this.transactionService.getTransaction(id).subscribe({

      next: (transaction) => {

        this.transactionForm.patchValue({

          budgetId: transaction.budgetId ?? null,

          amount: transaction.amount,

          description: transaction.description ?? '',

          transactionDate: transaction.transactionDate

        });

        this.isLoading = false;

        this.cdr.detectChanges();

      },

      error: (error) => {

        console.error(
          'Error loading transaction:',
          error
        );

        this.isLoading = false;

        if (error.status === 401) {

          this.errorMessage =
            'Your session has expired. Please login again.';

        } else if (error.status === 404) {

          this.errorMessage =
            'Transaction not found.';

        } else {

          this.errorMessage =
            'Unable to load transaction.';

        }

        this.cdr.detectChanges();

      }

    });

  }

  onSubmit(): void {

    if (this.transactionForm.invalid) {

      this.transactionForm.markAllAsTouched();

      return;

    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const formValue = this.transactionForm.getRawValue();

    const budgetId = formValue.budgetId;

    if (!budgetId) {

      this.errorMessage =
        'Please select a budget.';

      this.isSubmitting = false;

      return;

    }

    const transactionData: TransactionRequest = {

      amount: formValue.amount!,

      description: formValue.description || undefined,

      transactionDate: formValue.transactionDate!

    };

    if (
      this.isEditMode &&
      this.transactionId !== null
    ) {
      this.transactionService
        .updateTransaction(
          this.transactionId,
          transactionData
        )
        .subscribe({

          next: (response) => {
            this.isSubmitting = false;

            this.router.navigate([
              '/transactions'
            ]);

          },

          error: (error) => {

            console.error(
              'Error updating transaction:',
              error
            );

            this.isSubmitting = false;

            if (error.status === 400) {

              this.errorMessage =
                'Invalid transaction details.';

            } else if (error.status === 401) {

              this.errorMessage =
                'Your session has expired. Please login again.';

            } else if (error.status === 404) {

              this.errorMessage =
                'Transaction not found.';

            } else {

              this.errorMessage =
                'Unable to update transaction.';

            }

            this.cdr.detectChanges();

          }

        });

      return;
    }
    this.transactionService
      .createTransaction(
        budgetId,
        transactionData
      )
      .subscribe({

        next: (response) => {

          this.isSubmitting = false;

          this.router.navigate([
            '/transactions'
          ]);

        },

        error: (error) => {

          console.error(
            'Error creating transaction:',
            error
          );

          this.isSubmitting = false;

          if (error.status === 400) {

            this.errorMessage =
              'Invalid transaction details.';

          } else if (error.status === 401) {

            this.errorMessage =
              'Your session has expired. Please login again.';

          } else if (error.status === 404) {

            this.errorMessage =
              'Budget not found.';

          } else {

            this.errorMessage =
              'Unable to create transaction.';

          }

          this.cdr.detectChanges();

        }

      });

  }

  cancel(): void {

    this.router.navigate([
      '/transactions'
    ]);

  }

}