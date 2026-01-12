import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import * as CryptoJS from 'crypto-js';
import { Observable, Subscription, firstValueFrom, interval } from 'rxjs';
import { TOKEN_CHECK_INTERVAL } from '../../constants';
import { IAuthResponse, IUser } from '../../interfaces/auth.interfaces';
import { HttpService } from '../../services/http.service';

import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import { AuthenticationResult, EventMessage, EventType } from '@azure/msal-browser';
import { filter } from 'rxjs/operators';
import { AppConfigService } from '../../config/app-config.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  currentUser = signal<IUser | null>(null);
  private readonly platformId = inject(PLATFORM_ID);
  private isBrowser: boolean;
  private tokenCheckSubscription?: Subscription;
  private isLoggingOut = false;

  isAuthenticated = computed(() => this.currentUser() !== null);

  private readonly httpService = inject(HttpService);
  private readonly router = inject(Router);
  private msalService = inject(MsalService);
  private msalBroadcast = inject(MsalBroadcastService);
  private appConfig = inject(AppConfigService);

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser && this.appConfig.isLocalAuth()) {
      this.startTokenExpiryCheck();
    }
    this.initializeMsal();
  }

  private initializeMsal() {
    if (this.appConfig.isAzureAuth()) {
      this.msalBroadcast.msalSubject$
        .pipe(
          filter(
            (msg: EventMessage) =>
              msg.eventType === EventType.LOGIN_SUCCESS ||
              msg.eventType === EventType.ACQUIRE_TOKEN_SUCCESS,
          ),
        )
        .subscribe((result: EventMessage) => {
          const payload = result.payload as AuthenticationResult;
          this.msalService.instance.setActiveAccount(payload.account);
        });

      const accounts = this.msalService.instance.getAllAccounts();
      if (accounts.length > 0) {
        this.msalService.instance.setActiveAccount(accounts[0]);
      }
    }
  }

  async restoreSessionFromCookies(): Promise<boolean> {
    if (!this.isBrowser) return false;

    if (this.currentUser() !== null) return true;

    try {
      const response = await firstValueFrom(this.httpService.getUserProfile(), {
        defaultValue: null,
      });

      if (response?.data?.user) {
        this.currentUser.set(response.data.user);
        return true;
      }
    } catch (error) {
      // Session restore failed
    }

    this.currentUser.set(null);
    return false;
  }

  async waitForAuthCheck(): Promise<boolean> {
    return this.restoreSessionFromCookies();
  }

  private encryptPassword(password: string): string {
    // Hash password using SHA-256
    return CryptoJS.SHA256(password).toString();
  }

  login(credentials?: { email: string; password: string }): Observable<IAuthResponse> | void {
    if (this.appConfig.isLocalAuth()) {
      if (!credentials) {
        throw new Error('Credentials required for local login');
      }

      return this.httpService.login(credentials);
    } else {
      this.msalService.loginRedirect({
        scopes: ['user.read'],
      });
    }
  }

  register(credentials: {
    name: string;
    email: string;
    password: string;
  }): Observable<IAuthResponse> {
    if (this.appConfig.isAzureAuth()) {
      throw new Error('Registration not available for Azure AD authentication');
    }

    return this.httpService.register(credentials);
  }

  setUserData(user: IUser): void {
    const cleanUser = user;
    this.currentUser.set(cleanUser);
  }

  getUserProfile(): Observable<IAuthResponse> {
    return this.httpService.getUserProfile();
  }

  async logout(): Promise<void> {
    if (!this.isBrowser) return;

    if (this.isLoggingOut) {
      return;
    }

    this.isLoggingOut = true;

    try {
      if (this.appConfig.isLocalAuth()) {
        await firstValueFrom(this.httpService.logout());
      } else {
        await firstValueFrom(this.httpService.blacklistAzureToken());
      }
    } catch (error) {
      console.error('logout error', error);
    }

    this.currentUser.set(null);
    if (this.appConfig.isAzureAuth()) {
      this.msalService.logoutRedirect();
    } else {
      await this.router.navigate(['/login']);
    }

    this.isLoggingOut = false;
  }

  async setUserProfile(): Promise<void> {
    try {
      const response = await firstValueFrom(this.httpService.getUserProfile());

      if (response?.data?.user) {
        this.currentUser.set(response.data.user);
      } else {
        this.currentUser.set(null);
      }
    } catch (error) {
      console.error('Failed ro fetch user profile', error);
      this.currentUser.set(null);
    }
  }

  private startTokenExpiryCheck(): void {
    this.tokenCheckSubscription = interval(TOKEN_CHECK_INTERVAL).subscribe(async () => {
      if (this.isAuthenticated()) {
        const refreshed = await this.refreshToken();
        if (!refreshed) {
          this.logout();
        }
      }
    });
  }

  getAccessToken(): string | null {
    if (this.appConfig.isAzureAuth()) {
      const account = this.msalService.instance.getActiveAccount();
      if (!account) return null;
      // Token will be acquired by MSAL interceptor
      return null;
    }
    return null; // Tokens are in httpOnly cookies
  }

  async refreshToken(): Promise<boolean> {
    if (!this.isBrowser) return false;

    try {
      await firstValueFrom(this.httpService.refreshToken());
      // If we reach here, refresh was successful (200 status)
      return true;
    } catch {
      // Refresh failed
      return false;
    }
  }
}
