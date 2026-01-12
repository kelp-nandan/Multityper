import { environment } from '../../environments/environment';

export const API_ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    LOGIN: `${environment.apiUrl}/api/auth/login`,
    REGISTER: `${environment.apiUrl}/api/auth/register`,
    LOGOUT: `${environment.apiUrl}/api/auth/logout`,
    PROFILE: `${environment.apiUrl}/api/auth/profile`,
    BLACKLIST_AZURE_TOKEN: `${environment.apiUrl}/api/auth/blacklist-azure-token`,
  },

  // Token management endpoints
  TOKEN: {
    REFRESH: `${environment.apiUrl}/api/token/refresh`,
  },

  // User management endpoints
  USERS: {
    PROFILE: `${environment.apiUrl}/api/users/profile`,
    LIST: `${environment.apiUrl}/api/users`,
  },
  // Leaderboard endpoints
  LEADERBOARD: {
    STATS: `${environment.apiUrl}/api/leaderboard/getStats`,
  },
} as const;
