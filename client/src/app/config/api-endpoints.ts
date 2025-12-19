import { environment } from '../../environments/environment';

export const API_ENDPOINTS = {
  // Base API URL
  BASE_URL: environment.apiUrl,

  // Authentication endpoints
  AUTH: {
    BASE: `${environment.apiUrl}/users`,
    LOGIN: `${environment.apiUrl}/users/login`,
    REGISTER: `${environment.apiUrl}/users/register`,
    LOGOUT: `${environment.apiUrl}/users/logout`,
    PROFILE: `${environment.apiUrl}/users/profile`,
    REFRESH: `${environment.apiUrl}/users/refresh`,
    LIST_USERS: `${environment.apiUrl}/users`,
  },

  // Paragraph endpoints
  PARAGRAPHS: {
    BASE: `${environment.apiUrl}/paragraphs`,
    RANDOM: `${environment.apiUrl}/paragraphs/random`,
    BY_NUMBER: `${environment.apiUrl}/paragraphs/number`,
  },
} as const;
