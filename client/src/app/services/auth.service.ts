import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, interval, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import * as bcrypt from 'bcryptjs';

interface User {
  id: number;
  name: string;
  email: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user?: User;
    accessToken?: string;
    refreshToken?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/users';
  currentUser = signal<User | null>(null);
  isAuthenticated = signal<boolean>(false);
  private platformId = inject(PLATFORM_ID);
  private isBrowser: boolean;
  private tokenCheckSubscription?: Subscription;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      this.loadUserFromStorage();
      this.startTokenExpiryCheck();
    }
  }

  private loadUserFromStorage() {
    if (!this.isBrowser) return;

    // Check if user is authenticated by trying to get profile
    this.getUserProfile().subscribe({
      next: (response) => {
        if (response.success && response.data.user) {
          this.currentUser.set(response.data.user);
          this.isAuthenticated.set(true);
        }
      },
      error: () => {
        this.currentUser.set(null);
        this.isAuthenticated.set(false);
      }
    });
  }

  private hashPassword(password: string): string {
    // Use SHA-256 for consistent client-side hashing (same input = same hash)
    // This hides the password in network tab while being deterministic
    return bcrypt.hashSync(password, '$2a$10$abcdefghijklmnopqrstuv');
  }

  login(email: string, password: string): Observable<AuthResponse> {
    const hashedPassword = this.hashPassword(password);
    return this.http.post<AuthResponse>(
      `${this.apiUrl}/login`,
      { email, password: hashedPassword },
      { withCredentials: true } // Send cookies with request
    );
  }

  register(userData: any): Observable<AuthResponse> {
    const hashedPassword = this.hashPassword(userData.password);
    return this.http.post<AuthResponse>(
      `${this.apiUrl}/register`,
      {
        ...userData,
        password: hashedPassword
      },
      { withCredentials: true }
    );
  }

  setUserData(user: User) {
    this.currentUser.set(user);
    this.isAuthenticated.set(true);
  }

  getUserProfile(): Observable<AuthResponse> {
    return this.http.get<AuthResponse>(
      `${this.apiUrl}/profile`,
      { withCredentials: true } // Cookies sent automatically
    );
  }

  async logout() {
    if (!this.isBrowser) return;

    try {
      await this.http.post(
        `${this.apiUrl}/logout`,
        {},
        { withCredentials: true } // Send cookies for backend to revoke
      ).toPromise();
    } catch (error) {
      console.error('Logout error:', error);
    }

    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.tokenCheckSubscription?.unsubscribe();
    this.router.navigate(['/']);
  }

  // Tokens are now in httpOnly cookies, no need to access them from JS

  private startTokenExpiryCheck() {
    // Check authentication status every 5 minutes
    this.tokenCheckSubscription = interval(5 * 60000).subscribe(async () => {
      if (this.isAuthenticated()) {
        // Try to refresh the token periodically
        try {
          await this.http.post<AuthResponse>(
            `${this.apiUrl}/refresh`,
            {},
            { withCredentials: true }
          ).toPromise();
          // Token refreshed successfully (new cookie set by backend)
        } catch (error) {
          console.error('Token refresh failed:', error);
          // If refresh fails, logout
          alert('Your session has expired. Please login again.');
          this.logout();
        }
      }
    });
  }

  async refreshToken(): Promise<boolean> {
    if (!this.isBrowser) return false;

    try {
      const response = await this.http.post<AuthResponse>(
        `${this.apiUrl}/refresh`,
        {},
        { withCredentials: true }
      ).toPromise();

      if (response?.success) {
        // New access token cookie set by backend
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }
    return false;
  }
}