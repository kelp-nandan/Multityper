import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Homepage } from './homepage/homepage';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/homepage',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: Login,
    canActivate: [authGuard],
    data: { requiresAuth: false }, // Guest route
  },
  {
    path: 'homepage',
    component: Homepage,
    canActivate: [authGuard],
    data: { requiresAuth: true }, // Protected route
  },
  { path: '**', redirectTo: '/homepage' },
];
