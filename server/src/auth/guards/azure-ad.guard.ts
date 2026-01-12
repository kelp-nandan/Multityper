import { ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { firstValueFrom } from "rxjs";
import { AuthConfigService } from "../../config/auth-config.service";
import { RedisService } from "../../redis/redis.service";
import { UtiExtractor } from "../utils/uti-extractor";

@Injectable()
export class AzureAdGuard extends AuthGuard("azure-ad") {
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

    if (authStrategy === "local") {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (authHeader) {
      const token = UtiExtractor.extractTokenFromHeader(authHeader);
      if (token) {
        const uti = UtiExtractor.extractUti(token);
        if (uti) {
          const isBlacklisted = await this.redisService.isTokenBlacklisted(uti, "uti");
          if (isBlacklisted) throw new UnauthorizedException("Token has been revoked");
        }
      }
    }

    const canActivate = super.canActivate(context);

    if (canActivate instanceof Promise) {
      return await canActivate;
    } else if (typeof canActivate === "boolean") {
      return canActivate;
    } else {
      return await firstValueFrom(canActivate);
    }
  }
}
