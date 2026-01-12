import { Routes } from '@angular/router';

import { LeaderBoard } from './game/leaderboard/leaderboard';
import { HomePage } from './homepage/homepage';
import { authGuard } from './identity/guards/auth.guard';
import { leaderboardGuard } from './identity/guards/leaderboard.guard';
import { Login } from './identity/login/login';

export const routes: Routes = [
  {
    path: '',
    component: Login,
  },
  {
    path: 'login',
    component: Login,
  },
  {
    path: 'homepage',
    canActivate: [authGuard],
    component: HomePage,
  },
  {
    path: 'rooms/:_id',
    canActivate: [authGuard],
    loadComponent: () => import('./game/gamelobby/gamelobby').then((c) => c.GameLobby),
    data: { requiresAuth: true },
  },
  {
    path: 'game-dashboard/:_id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./game/game-dashboard/game-dashboard').then((c) => c.GameDashboard),
    data: { requiresAuth: true },
  },
  {
    path: 'leaderboard',
    canActivate: [leaderboardGuard],
    component: LeaderBoard,
    data: { requiresAuth: true },
  },
  {
    path: '**',

    redirectTo: '',
  },
];
