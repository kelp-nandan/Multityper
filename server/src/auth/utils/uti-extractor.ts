import * as jwt from "jsonwebtoken";
import { IDecodedToken } from "../../interfaces/common.interface";

export class UtiExtractor {
  static extractUti(token: string): string | null {
    try {
      const decoded: IDecodedToken = jwt.decode(token) as IDecodedToken;
      return decoded?.uti || null;
    } catch (error) {
      return null;
    }
  }

  static extractTokenFromHeader(authHeader: string): string | null {
    if (!authHeader) return null;

    const parts = authHeader.split(" ");
    if (parts.length === 2 && parts[0] === "Bearer") {
      return parts[1];
    }
    return null;
  }
}
