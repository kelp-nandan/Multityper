import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_ENDPOINTS } from '../config/api-endpoints';
import {
  IAuthResponse,
  ILoginRequest,
  ILogoutResponse,
  IRegisterRequest,
  IUsersListResponse,
} from '../interfaces/auth.interfaces';
import { IFetchStats } from '../interfaces/socket.interfaces';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  private readonly http = inject(HttpClient);

  login(loginData: ILoginRequest): Observable<IAuthResponse> {
    return this.http.post<IAuthResponse>(API_ENDPOINTS.AUTH.LOGIN, loginData);
  }

  register(registerData: IRegisterRequest): Observable<IAuthResponse> {
    return this.http.post<IAuthResponse>(API_ENDPOINTS.AUTH.REGISTER, registerData);
  }

  logout(): Observable<ILogoutResponse> {
    return this.http.post<ILogoutResponse>(API_ENDPOINTS.AUTH.LOGOUT, {});
  }

  refreshToken(): Observable<IAuthResponse> {
    return this.http.post<IAuthResponse>(API_ENDPOINTS.TOKEN.REFRESH, {});
  }

  getUsers(): Observable<IUsersListResponse> {
    return this.http.get<IUsersListResponse>(API_ENDPOINTS.USERS.LIST);
  }

  getUserStats(): Observable<{ data: IFetchStats }> {
    return this.http.get<{ data: IFetchStats }>(API_ENDPOINTS.LEADERBOARD.STATS);
  }

  blacklistAzureToken(): Observable<void> {
    return this.http.post<void>(API_ENDPOINTS.AUTH.BLACKLIST_AZURE_TOKEN, {});
  }

  getUserProfile(): Observable<IAuthResponse> {
    return this.http.get<IAuthResponse>(API_ENDPOINTS.AUTH.PROFILE);
  }
}
