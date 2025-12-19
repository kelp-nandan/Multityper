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

  // // Future endpoints for typing game features
  // GAMES: {
  //     BASE: `${environment.apiUrl}/games`,
  //     CREATE: `${environment.apiUrl}/games/create`,
  //     JOIN: `${environment.apiUrl}/games/join`,
  //     LIST: `${environment.apiUrl}/games/list`,
  //     LEAVE: `${environment.apiUrl}/games/leave`
  // },

  // // Leaderboard and stats endpoints
  // LEADERBOARD: `${environment.apiUrl}/leaderboard`,
  // STATS: `${environment.apiUrl}/stats`,

  // // Real-time endpoints
  // WEBSOCKET: {
  //     BASE: environment.apiUrl.replace('http', 'ws'),
  //     GAME_ROOM: `${environment.apiUrl.replace('http', 'ws')}/game-room`
  // }
} as const;

// Type-safe endpoint getter
export function getEndpoint(endpoint: keyof typeof API_ENDPOINTS): string {
  return API_ENDPOINTS[endpoint] as string;
}

// Helper function to build dynamic endpoints
export function buildEndpoint(base: string, ...segments: string[]): string {
  return [base, ...segments].join('/');
}
