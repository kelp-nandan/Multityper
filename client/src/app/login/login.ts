import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user?: {
      id: number;
      name: string;
      email: string;
    };
    accessToken?: string;
    refreshToken?: string;
  };
}

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule, HttpClientModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class Login {
  isLoginMode = signal(true);
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  loginForm: FormGroup;
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });

    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  toggleMode() {
    this.isLoginMode.set(!this.isLoginMode());
    this.clearMessages();
  }

  onLogin() {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      this.clearMessages();

      const { email, password } = this.loginForm.value;
      this.authService.login(email, password).subscribe({
        next: (response) => {
          this.isLoading.set(false);
          // If we reach here, HTTP status was 2xx (success)
          if (response.data?.user) {
            this.authService.setUserData(response.data.user);
            this.successMessage.set('Login successful! Redirecting...');
            this.router.navigate(['/homepage']);
          } else {
            this.errorMessage.set('Login failed - no user data received');
          }
        },
        error: (error) => {
          this.isLoading.set(false);

          // Simplified error handling based on status code ranges
          const message =
            error.status === 401
              ? 'Invalid email or password'
              : error.status === 409
                ? 'Email already exists'
                : error.status === 422
                  ? 'Please check your input'
                  : error.status === 429
                    ? 'Too many attempts - please wait'
                    : error.status >= 500
                      ? 'Server error - try again later'
                      : error.status === 0
                        ? 'Network error - check connection'
                        : error.error?.message || 'Please try again';

          this.errorMessage.set(message);
        },
      });
    }
  }

  onRegister() {
    if (this.registerForm.valid) {
      this.isLoading.set(true);
      this.clearMessages();

      this.authService.register(this.registerForm.value).subscribe({
        next: (response) => {
          this.isLoading.set(false);
          // If we reach here, HTTP status was 2xx (success)
          this.successMessage.set('Registration successful! Please login.');
          this.isLoginMode.set(true);
          this.registerForm.reset();
        },
        error: (error) => {
          this.isLoading.set(false);

          // Simplified error handling - same pattern as login
          const message =
            error.status === 409
              ? 'Email already exists - use different email'
              : error.status === 422
                ? 'Please check your input'
                : error.status === 429
                  ? 'Too many attempts - please wait'
                  : error.status >= 500
                    ? 'Server error - try again later'
                    : error.status === 0
                      ? 'Network error - check connection'
                      : error.error?.message || 'Registration failed - please try again';

          this.errorMessage.set(message);
        },
      });
    }
  }

  private clearMessages() {
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  getFieldError(form: FormGroup, field: string): string {
    const control = form.get(field);
    if (control?.errors && control.touched) {
      if (control.errors['required']) return `${field} is required`;
      if (control.errors['email']) return 'Invalid email format';
      if (control.errors['minlength'])
        return `${field} must be at least ${control.errors['minlength'].requiredLength} characters`;
      if (control.errors['pattern']) {
        if (field === 'password' && form === this.registerForm) {
          return 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character';
        }
      }
    }
    return '';
  }
}
