import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuthenticated = await authService.waitForAuthCheck();
  const requiresAuth = route.data?.['requiresAuth'] !== false; // Default to true

  if (requiresAuth) {
    // Protected route - requires authentication
    if (isAuthenticated) {
      return true;
    }
    router.navigate(['/login'], {
      queryParams: { returnUrl: state.url },
    });
    return false;
  } else {
    // Guest route - requires NO authentication
    if (!isAuthenticated) {
      return true;
    }
    router.navigate(['/homepage']);
    return false;
  }
};
