import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { AppConfigService } from '../../config/app-config.service';
import { IAuthResponse } from '../../interfaces/auth.interfaces';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class Login implements OnInit {
  isLoginMode = signal(true);
  isLoading = signal<boolean>(false);
  errorMessage = signal('');
  successMessage = signal('');
  passwordStrength = signal(0);

  authStrategy = signal<'local' | 'azure'>('local');

  loginForm: FormGroup;
  registerForm: FormGroup;

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly appConfig = inject(AppConfigService);
  private readonly msalService = inject(MsalService);

  constructor() {
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

  ngOnInit(): void {
    this.authStrategy.set(this.appConfig.authStrategy);

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/homepage']);
      return;
    }

    if (this.authStrategy() === 'azure') {
      const account = this.msalService.instance.getActiveAccount();
      if (account) {
        this.router.navigate(['/homepage']);
      }
    }
  }

  toggleMode(): void {
    this.isLoginMode.set(!this.isLoginMode());
    this.clearMessages();
  }

  async onLogin(): Promise<void> {
    if (this.authStrategy() === 'local') {
      if (this.loginForm.invalid) {
        return;
      }

      this.isLoading.set(true);
      this.errorMessage.set('');

      this.authService.login(this.loginForm.value)?.subscribe({
        next: (response: IAuthResponse) => {
          this.isLoading.set(false);
          if (response?.data?.user) {
            this.authService.setUserData(response.data.user);
            this.router.navigate(['/homepage']);
          }
        },
        error: (error: { status?: number; error?: { message?: string }; message?: string }) => {
          this.isLoading.set(false);
          this.errorMessage.set(error?.error?.message || error?.message || 'Login failed');
        },
      });
    } else {
      this.isLoading.set(true);
      try {
        this.msalService.loginRedirect({
          scopes: ['user.read'],
        });
      } catch (error) {
        this.isLoading.set(false);
        this.errorMessage.set('Azure AD login failed. Please try again.');
      }
    }
  }

  onRegister(): void {
    if (this.registerForm.valid) {
      this.isLoading.set(true);
      this.clearMessages();

      this.authService.register(this.registerForm.value).subscribe({
        next: (response: IAuthResponse) => {
          this.isLoading.set(false);
          if (response?.data?.user) {
            this.authService.setUserData(response.data.user);
            this.successMessage.set('Registration successful! Redirecting...');
            setTimeout(() => this.router.navigate(['/homepage']), 1500);
          }
        },
        error: (error: { status?: number; error?: { message?: string } }) => {
          this.isLoading.set(false);
          const message = this.getErrorMessage(error);
          this.errorMessage.set(message);
        },
      });
    }
  }

  isLocalAuth(): boolean {
    return this.authStrategy() === 'local';
  }

  isAzureAuth(): boolean {
    return this.authStrategy() === 'azure';
  }

  private clearMessages(): void {
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
    }
    return '';
  }

  private getErrorMessage(error: { status?: number; error?: { message?: string } }): string {
    return error.error?.message || 'Please try again';
  }

  updatePasswordStrength(event: Event): void {
    const input = event.target as HTMLInputElement;
    const password = input.value;
    let strength = 0;

    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;

    this.passwordStrength.set(Math.min(strength, 4));
  }
}
