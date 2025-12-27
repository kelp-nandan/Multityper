import { environment } from '../../environments/environment';

export const API_ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    LOGIN: `${environment.apiUrl}/auth/login`,
    REGISTER: `${environment.apiUrl}/auth/register`,
    LOGOUT: `${environment.apiUrl}/auth/logout`,
  },

  // Token management endpoints
  TOKEN: {
    REFRESH: `${environment.apiUrl}/token/refresh`,
  },

  // User management endpoints
  USERS: {
    PROFILE: `${environment.apiUrl}/users/profile`,
    LIST: `${environment.apiUrl}/users`,
  },
} as const;
