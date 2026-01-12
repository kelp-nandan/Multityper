export interface IJwtPayload {
  id: number;
  email: string;
  iat?: number;
  exp?: number;
}

export interface IAzureUserInfo {
  id: string;
  displayName: string;
  mail?: string;
  userPrincipalName: string;
  givenName?: string;
  surname?: string;
}

export interface IDecodedToken {
  uti?: string;
  [key: string]: unknown;
}

export interface IUserSession {
  userId: number;
  email: string;
  name: string;
  createdAt: number;
}

export interface IRoomData {
  roomId: string;
  players: string[];
  status: string;
  createdAt: number;
  [key: string]: unknown;
}
