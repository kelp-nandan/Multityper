import { Routes } from '@angular/router';

import { Homepage } from './homepage/homepage';
import { authGuard } from './identity/guards/auth.guard';
import { leaderboardGuard } from './identity/guards/leaderboard.guard';
import { Login } from './identity/login/login';
import { Leaderboard } from './game/leaderboard/leaderboard';

export const routes: Routes = [
  {
    path: '',
    component: Login,
  },
  {
    path: 'login',
    canActivate: [authGuard],
    component: Login,
    data: { requiresAuth: false },
  },
  {
    path: 'homepage',
    canActivate: [authGuard],
    component: Homepage,
    data: { requiresAuth: true },
  },
  {
    path: 'rooms/:_id',
    canActivate: [authGuard],
    loadComponent: () => import('./game/gamelobby/gamelobby').then((c) => c.Gamelobby),
    data: { requiresAuth: true },
  },
  {
    path: 'game-dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./game/game-dashboard/game-dashboard').then((c) => c.GameDashboard),
    data: { requiresAuth: true },
  },
  {
    path: 'leaderboard',
    canActivate: [leaderboardGuard],
    component: Leaderboard,
    data: { requiresAuth: true },
  },
  {
    path: '**',

    redirectTo: '',
  },
];
