import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { IJwtPayload } from "../../interfaces/common.interface";
import { RedisService } from "../../redis/redis.service";
import { UsersService } from "../../users/users.service";
import { SessionUser } from "../session-user";

@Injectable()
export class LocalJwtStrategy extends PassportStrategy(Strategy, "local-jwt") {
  constructor(
    private usersService: UsersService,
    private redisService: RedisService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          let token = request?.cookies?.access_token;

          if (!token) {
            const authHeader = request?.headers.authorization;
            if (authHeader && authHeader.startsWith("Bearer")) {
              token = authHeader.substring(7);
            }
          }
          return token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || ">@%%_|m!cmA4M63E",
      passReqToCallback: true,
    });
  }

  async validate(request: Request, payload: IJwtPayload): Promise<SessionUser> {
    const token = request?.cookies?.access_token || request?.headers?.authorization?.substring(7);

    if (!token) {
      throw new UnauthorizedException("Token not found");
    }

    const isBlacklisted = await this.redisService.isTokenBlacklisted(token, "access");
    if (isBlacklisted) {
      throw new UnauthorizedException("Token has been revoked");
    }
    const user = await this.usersService.findById(payload.id);

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    return new SessionUser(user.id, user.email, user.name);
  }
}
