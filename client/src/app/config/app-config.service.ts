import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export type AuthStrategy = 'local' | 'azure';

@Injectable({
  providedIn: 'root',
})
export class AppConfigService {
  get authStrategy(): AuthStrategy {
    return environment.authStrategy as AuthStrategy;
  }

  get apiUrl(): string {
    return environment.apiUrl;
  }

  get wsUrl(): string {
    return environment.wsUrl;
  }

  get msalConfig() {
    return environment.msalConfig;
  }

  isAzureAuth(): boolean {
    return this.authStrategy === 'azure';
  }

  isLocalAuth(): boolean {
    return this.authStrategy === 'local';
  }
}
