import { Route } from '@angular/router';
import { IsLoggedGuard } from '../../guard/is-logged-guard';

export const groupRoutes: Route[] = [
  {
    path: '',
    canActivate: [IsLoggedGuard],
    loadComponent: () => import('./list/list.component').then((value) => value.GroupListComponent),
  },
  {
    path: 'create',
    canActivate: [IsLoggedGuard],
    loadComponent: () => import('./create/create.component').then((value) => value.GroupCreateComponent),
  },
  {
    path: ':groupId/expense/:expenseId',
    canActivate: [IsLoggedGuard],
    loadComponent: () => import('./expense/expense.component').then((value) => value.ExpenseComponent),
  },
  {
    path: ':groupId',
    canActivate: [IsLoggedGuard],
    loadComponent: () => import('./details/details.component').then((value) => value.GroupDetailsComponent),
  },
];
