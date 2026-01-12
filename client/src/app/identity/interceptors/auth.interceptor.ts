import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { AppConfigService } from '../../config/app-config.service';
import { AuthService } from '../services/auth.service';

const EXCLUDED_URLS = ['/auth/refresh', '/auth/login', '/auth/logout', '/auth/register'];

const isExcludedUrl = (url: string): boolean => {
  return EXCLUDED_URLS.some((excluded) => url.includes(excluded));
};

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const appConfig = inject(AppConfigService);
  const msalService = inject(MsalService);

  let authReq = req.clone({ withCredentials: true });

  if (appConfig.isAzureAuth()) {
    const account = msalService.instance.getActiveAccount();

    if (!account) {
      return next(authReq);
    }

    return from(
      msalService.instance.acquireTokenSilent({
        scopes: ['user.read'],
        account,
      }),
    ).pipe(
      switchMap((response) => {
        const tokenReq = req.clone({
          withCredentials: true,
          setHeaders: {
            Authorization: `Bearer ${response.accessToken}`,
          },
        });
        return next(tokenReq);
      }),
      catchError((tokenError) => {
        console.warn('Token acquisition failed:', tokenError);
        return next(authReq);
      }),
      catchError((httpError: HttpErrorResponse) => {
        if (httpError.status === 401) {
          authService.logout();
        }
        return throwError(() => httpError);
      }),
    );
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isExcludedUrl(req.url)) {
        return from(authService.refreshToken()).pipe(
          switchMap((refreshed) => {
            if (!refreshed) {
              authService.logout();
              return throwError(() => error);
            }

            return next(req.clone({ withCredentials: true }));
          }),
          catchError(() => {
            authService.logout();
            return throwError(() => error);
          }),
        );
      }

      return throwError(() => error);
    }),
  );
};
