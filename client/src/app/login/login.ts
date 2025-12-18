import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
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
  styleUrls: ['./login.css']
})
export class Login {
  isLoginMode = signal(true);
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  loginForm: FormGroup;
  registerForm: FormGroup;

  private apiUrl = 'http://localhost:3000/api/users';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      ]]
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
          if (response.success && response.data.user) {
            // Tokens are now in httpOnly cookies, only store user data
            this.authService.setUserData(response.data.user);
            this.successMessage.set('Login successful! Redirecting...');
            setTimeout(() => {
              this.router.navigate(['/homepage']);
            }, 1000);
          }
        },
        error: (error) => {
          this.isLoading.set(false);
          this.errorMessage.set(error.error?.message || 'Login failed');
        }
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
          if (response.success) {
            this.successMessage.set('Registration successful! Please login.');
            this.isLoginMode.set(true);
            this.registerForm.reset();
          }
        },
        error: (error) => {
          this.isLoading.set(false);
          this.errorMessage.set(error.error?.message || 'Registration failed');
        }
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
      if (control.errors['minlength']) return `${field} is too short`;
      if (control.errors['pattern']) {
        if (field === 'password') return 'Password must contain uppercase, lowercase and number';
      }
    }
    return '';
  }
}