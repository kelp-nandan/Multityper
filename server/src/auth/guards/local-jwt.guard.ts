import { ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { AuthConfigService } from "../../config/auth-config.service";
import { RedisService } from "../../redis/redis.service";
import { TokenExtractor } from "../utils/token-extractor";

@Injectable()
export class LocalJwtGuard extends AuthGuard("local-jwt") {
  constructor(
    private reflector: Reflector,
    private authConfigService: AuthConfigService,
    private redisService: RedisService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.get<boolean>("isPublic", context.getHandler());
    if (isPublic) {
      return true;
    }

    const authStrategy = this.authConfigService.getAuthStrategy();
    if (authStrategy !== "local") {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = TokenExtractor.extractToken(request);

    if (token) {
      const isBlacklisted = await this.redisService.isTokenBlacklisted(token, "access");
      if (isBlacklisted) {
        throw new UnauthorizedException("Token has been revoked");
      }
    }

    return super.canActivate(context) as Promise<boolean>;
  }
}
