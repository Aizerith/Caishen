import { Routes } from '@angular/router';
import { IsLoggedGuard } from './guard/is-logged-guard';
import { NotLoggedGuard } from './guard/not-logged-guard';

export const routes: Routes = [
  {
    path: 'animation',
    loadComponent: () => import('./shared/demo-anime/demo-anime.component').then((m) => m.DemoAnimeComponent),
  },
  {
    path: 'group',
    canActivate: [IsLoggedGuard],
    loadChildren: () => import('./view/group/group.routes').then((value) => value.groupRoutes),
  },
  {
    path: 'login',
    canActivate: [NotLoggedGuard],
    loadComponent: () => import('./view/login/login.component').then((value) => value.LoginComponent),
  },
  {
    path: 'settings',
    canActivate: [IsLoggedGuard],
    loadComponent: () => import('./view/settings/settings.component').then((value) => value.SettingsComponent),
  },
  {
    path: 'register',
    canActivate: [NotLoggedGuard],
    loadComponent: () => import('./view/register/register.component').then((value) => value.RegisterComponent),
  },
  {
    path: 'join/:uuid',
    loadComponent: () => import('./view/join/join.component').then((value) => value.JoinComponent),
  },
  { path: '', redirectTo: '/group', pathMatch: 'full' },
];
