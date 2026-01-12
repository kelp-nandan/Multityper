import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { AppConfigService } from '../../config/app-config.service';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  const authService = inject(AuthService);
  const appConfig = inject(AppConfigService);
  const msalService = inject(MsalService);
  const router = inject(Router);

  if (appConfig.isLocalAuth()) {
    if (authService.isAuthenticated()) {
      return true;
    }

    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url },
    });
  } else {
    const account = msalService.instance.getActiveAccount();
    const allAccounts = msalService.instance.getAllAccounts();

    if (!account && allAccounts.length === 0) {
      const currentUrl = state.url;

      if (
        currentUrl === '/login' ||
        currentUrl.includes('code=') ||
        currentUrl.includes('state=')
      ) {
        return false;
      }

      msalService.loginRedirect({
        scopes: ['user.read'],
        state: state.url,
      });
      return false;
    }

    if (!account && allAccounts.length > 0) {
      msalService.instance.setActiveAccount(allAccounts[0]);
    }

    if (!authService.isAuthenticated() && msalService.instance.getActiveAccount()) {
      authService.setUserProfile().catch((err) => {
        console.error('Failed to load user profile in background:', err);
      });
    }

    return true;
  }
};
