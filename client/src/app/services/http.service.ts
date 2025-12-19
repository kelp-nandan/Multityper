import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../config/api-endpoints';

interface User {
  id: number;
  name: string;
  email: string;
}

interface AuthResponse {
  message: string;
  data: {
    user?: User;
    accessToken?: string;
    refreshToken?: string;
  };
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  constructor(private http: HttpClient) {}

  // Authentication HTTP calls
  login(loginData: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, loginData, {
      withCredentials: true,
    });
  }

  register(registerData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER, registerData, {
      withCredentials: true,
    });
  }

  getUserProfile(): Observable<AuthResponse> {
    return this.http.get<AuthResponse>(API_ENDPOINTS.AUTH.PROFILE, { withCredentials: true });
  }

  logout(): Observable<any> {
    return this.http.post(API_ENDPOINTS.AUTH.LOGOUT, {}, { withCredentials: true });
  }

  refreshToken(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(API_ENDPOINTS.AUTH.REFRESH, {}, { withCredentials: true });
  }

  // User management (admin)
  getUsers(): Observable<any> {
    return this.http.get(API_ENDPOINTS.AUTH.LIST_USERS, { withCredentials: true });
  }
}
