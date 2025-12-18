import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError, from } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);

    // Always include credentials (cookies) with requests
    const authReq = req.clone({
        withCredentials: true
    });

    return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
            // If 401 error and not already on refresh endpoint
            if (error.status === 401 && !req.url.includes('/refresh') && !req.url.includes('/login')) {
                // Try to refresh token using switchMap to properly handle async operation
                return from(authService.refreshToken()).pipe(
                    switchMap(success => {
                        if (success) {
                            // Retry the original request (cookies will be sent automatically)
                            const retryReq = req.clone({
                                withCredentials: true
                            });
                            return next(retryReq);
                        } else {
                            // Refresh failed, logout
                            authService.logout();
                            return throwError(() => error);
                        }
                    }),
                    catchError(() => {
                        authService.logout();
                        return throwError(() => error);
                    })
                );
            }
            return throwError(() => error);
        })
    );
};
