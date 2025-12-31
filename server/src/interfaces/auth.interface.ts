export interface IJwtPayload {
  id: number;
  name: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface IRefreshTokenPayload {
  id: number;
  iat?: number;
  exp?: number;
}
