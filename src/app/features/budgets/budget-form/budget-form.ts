import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BudgetService } from '../../../services/budget.service';

@Component({
  selector: 'app-budget-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './budget-form.html',
  styleUrl: './budget-form.css'
})
export class BudgetForm implements OnInit {

  budgetForm;

  isSubmitting = false;
  isEditMode = false;
  budgetId: number | null = null;

  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private budgetService: BudgetService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {

    this.budgetForm = this.fb.group({

  name: this.fb.control<string | null>(
    '',
    [
      Validators.required,
      Validators.minLength(2)
    ]
  ),

  amount: this.fb.control<number | null>(
    null,
    [
      Validators.required,
      Validators.min(1)
    ]
  ),

  month: this.fb.control<number | null>(
    null,
    [
      Validators.required,
      Validators.min(1),
      Validators.max(12)
    ]
  ),

  year: this.fb.control<number | null>(
    null,
    [
      Validators.required,
      Validators.min(2000),
      Validators.max(2100)
    ]
  )

});
  }


  ngOnInit(): void {

    const id = this.route.snapshot.paramMap.get('id');

    if (id) {

      this.isEditMode = true;
      this.budgetId = Number(id);

      this.loadBudget(this.budgetId);
    }
  }


  loadBudget(id: number): void {

    this.budgetService.getBudget(id).subscribe({

      next: (budget) => {

        this.budgetForm.patchValue({
          name: budget.name,
          amount: budget.amount,
          month: budget.month,
          year : budget.year
        });

        this.cdr.detectChanges();
      },

      error: (error) => {

        console.error('Error loading budget:', error);

        if (error.status === 401) {

          this.errorMessage =
            'Your session has expired. Please login again.';

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


  onSubmit(): void {

    if (this.budgetForm.invalid) {

      this.budgetForm.markAllAsTouched();

      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const budgetData = {
      name: this.budgetForm.value.name!,
      amount: this.budgetForm.value.amount!,
      month: this.budgetForm.value.month!,
      year: this.budgetForm.value.year!
    };


    // EDIT MODE
    if (this.isEditMode && this.budgetId !== null) {

      this.budgetService
        .updateBudget(this.budgetId, budgetData)
        .subscribe({

          next: (response) => {
            this.isSubmitting = false;

            this.router.navigate([
              '/budgets',
              this.budgetId
            ]);
          },

          error: (error) => {

            console.error(
              'Error updating budget:',
              error
            );

            this.isSubmitting = false;

            if (error.status === 400) {

              this.errorMessage =
                'Invalid budget details. Please check your input.';

            } else if (error.status === 401) {

              this.errorMessage =
                'Your session has expired. Please login again.';

            } else if (error.status === 404) {

              this.errorMessage =
                'Budget not found.';

            } else {

              this.errorMessage =
                'Unable to update budget. Please try again.';
            }

            this.cdr.detectChanges();
          }

        });

      return;
    }


    // CREATE MODE

    this.budgetService
      .createBudget(budgetData)
      .subscribe({

        next: (response) => {
          this.isSubmitting = false;

          this.router.navigate(['/budgets']);
        },

        error: (error) => {

          console.error(
            'Error creating budget:',
            error
          );

          this.isSubmitting = false;

          if (error.status === 400) {

            this.errorMessage =
              'Invalid budget details. Please check your input.';

          } else if (error.status === 401) {

            this.errorMessage =
              'Your session has expired. Please login again.';

          } else {

            this.errorMessage =
              'Unable to create budget. Please try again.';
          }

          this.cdr.detectChanges();
        }

      });
  }


  cancel(): void {

    if (this.isEditMode && this.budgetId !== null) {

      this.router.navigate([
        '/budgets',
        this.budgetId
      ]);

    } else {

      this.router.navigate(['/budgets']);

    }
  }
}