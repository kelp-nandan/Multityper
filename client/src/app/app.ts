import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import { AppConfigService } from './config/app-config.service';
import { AuthService } from './identity/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  protected readonly title = signal('client');
  private msalService = inject(MsalService);
  private msalBroadcastService = inject(MsalBroadcastService);
  private appConfig = inject(AppConfigService);
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    if (!this.appConfig.isAzureAuth()) {
      return;
    }

    this.msalService.handleRedirectObservable().subscribe({
      next: (response) => {
        if (response?.account) {
          this.msalService.instance.setActiveAccount(response.account);
          this.router.navigate(['/homepage']);
          return;
        }

        const accounts = this.msalService.instance.getAllAccounts();
        if (accounts.length === 0) {
          return;
        }

        if (!this.msalService.instance.getActiveAccount()) {
          this.msalService.instance.setActiveAccount(accounts[0]);
        }

        const currentUrl = this.router.url;
        if (currentUrl === '/' || currentUrl === '/login') {
          this.router.navigate(['/homepage']);
        }
      },
      error: (error) => {
        console.error('MSAL redirect error:', error);
      },
    });
  }
}
