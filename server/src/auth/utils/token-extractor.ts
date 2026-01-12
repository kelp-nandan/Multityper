import { Request } from "express";

export class TokenExtractor {
  //Extract JWT token from cookie or Authorization header
  static extractToken(request: Request): string | null {
    if (request.cookies && request.cookies.access_token) {
      return request.cookies.access_token;
    }

    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      return authHeader.substring(7);
    }

    return null;
  }

  //Extract refresh token from cookie or Authorization header
  static extractRefreshToken(request: Request): string | null {
    if (request.cookies && request.cookies.refresh_token) {
      return request.cookies.refresh_token;
    }

    const refreshHeader = request.headers["x-refresh-token"];
    if (refreshHeader && typeof refreshHeader === "string") {
      return refreshHeader;
    }

    return null;
  }

  //Extract token from Authorization header only

  static extractBearerToken(authHeader: string | undefined): string | null {
    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(" ");
    if (parts.length === 2 && parts[0] === "Bearer") {
      return parts[1];
    }

    return null;
  }
}
