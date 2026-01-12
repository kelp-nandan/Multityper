import { ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthConfigService } from "src/config/auth-config.service";
import { AzureAdGuard } from "./azure-ad.guard";
import { LocalJwtGuard } from "./local-jwt.guard";

@Injectable()
export class JwtAuthGuard {
  constructor(
    private reflector: Reflector,
    private authConfigService: AuthConfigService,
    private localJwtGuard: LocalJwtGuard,
    private azureAdGuard: AzureAdGuard,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.get<boolean>("isPublic", context.getHandler());
    if (isPublic) {
      return true;
    }

    const authStrategy = this.authConfigService.getAuthStrategy();

    if (authStrategy === "local") {
      return this.localJwtGuard.canActivate(context) as Promise<boolean>;
    } else {
      return this.azureAdGuard.canActivate(context) as Promise<boolean>;
    }
  }
}
