export interface IJwtPayload {
  id: number;
  name: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface IRefreshTokenPayload {
  id: number;
  type: "refresh";
  iat?: number;
  exp?: number;
}
