import { Route } from '@angular/router';
import { IsLoggedGuard } from '../../guard/is-logged-guard';

export const groupRoutes: Route[] = [
  {
    path: '',
    canActivate: [IsLoggedGuard],
    loadComponent: () => import('./group.component').then((value) => value.GroupComponent),
  },
  {
    path: 'add',
    canActivate: [IsLoggedGuard],
    loadComponent: () => import('./add/add.component').then((value) => value.AddComponent),
  },
  {
    path: ':groupId/expense/:expenseId',
    canActivate: [IsLoggedGuard],
    loadComponent: () => import('./expense/expense.component').then((value) => value.ExpenseComponent),
  },
  {
    path: ':id',
    canActivate: [IsLoggedGuard],
    loadComponent: () => import('./check/check.component').then((value) => value.CheckComponent),
  },
];
