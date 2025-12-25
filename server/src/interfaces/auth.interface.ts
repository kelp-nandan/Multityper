export interface IJwtPayload {
  sub: number;
  userId: number;
  name: string;
  email: string;
  iat?: number;
  exp?: number;
}
