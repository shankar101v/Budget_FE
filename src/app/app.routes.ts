import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  //public 

  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login')
        .then(m => m.Login)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register')
        .then(m => m.Register)
  },

  //protected 

  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard')
        .then(m => m.Dashboard)
  },
  {
    path: 'budgets',
    canActivate : [authGuard],
    loadComponent: () =>
      import('./features/budgets/budget-list/budget-list')
        .then(m => m.BudgetList)
  },
  {
  path: 'budgets/new',
  loadComponent: () =>
    import('./features/budgets/budget-form/budget-form')
      .then(m => m.BudgetForm)
  },
  {
  path: 'budgets/:id/edit',
  loadComponent: () =>
    import('./features/budgets/budget-form/budget-form')
      .then(m => m.BudgetForm)
  },
  {
    path: 'budgets/:id',
    canActivate : [authGuard],
    loadComponent: () =>
      import('./features/budgets/budget-detail/budget-detail')
        .then(m => m.BudgetDetail)
  },
  {
  path: 'profile',
  loadComponent: () =>
    import('./features/profile/profile')
      .then(m => m.Profile)
},
  {
  path: 'transactions',
  loadComponent: () =>
    import('./features/transactions/transaction-list/transaction-list')
      .then(m => m.TransactionList)
},
{
  path: 'transactions/new',
  loadComponent: () =>
    import('./features/transactions/transaction-form/transaction-form')
      .then(m => m.TransactionForm)
},
{
  path: 'transactions/:id/edit',
  loadComponent: () =>
    import('./features/transactions/transaction-form/transaction-form')
      .then(m => m.TransactionForm)
},
  {
    path: '**',
    redirectTo: 'login'
  }
];