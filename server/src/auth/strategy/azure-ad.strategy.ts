import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import axios from "axios";
import { Strategy } from "passport-custom";
import { AuthConfigService } from "../../config/auth-config.service";
import { IAzureUserInfo } from "../../interfaces/common.interface";
import { IUserProfile } from "../../users/interfaces";
import { UsersService } from "../../users/users.service";
import { SessionUser } from "../session-user";

@Injectable()
export class AzureADStrategy extends PassportStrategy(Strategy, "azure-ad") {
  constructor(
    private authConfigService: AuthConfigService,
    private usersService: UsersService,
  ) {
    super();
  }

  async validate(req: Request): Promise<SessionUser> {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedException("No Bearer token provided");
    }

    const accessToken = authHeader.substring(7);

    try {
      const response = await axios.get("https://graph.microsoft.com/v1.0/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const userInfo: IAzureUserInfo = response.data;

      const email = userInfo.mail || userInfo.userPrincipalName;
      if (!email) {
        throw new UnauthorizedException("Email not found in Azure AD user profile");
      }

      let user: IUserProfile | null = await this.usersService.findByEmail(email);

      if (!user && this.authConfigService.getAllowUserRegistration()) {
        const name = userInfo.displayName || email.split("@")[0];
        user = await this.usersService.createAzureUser({
          email,
          name,
          azureOid: userInfo.id,
          azureTenantId: userInfo.id,
        });
      }

      if (!user) {
        throw new UnauthorizedException("User not found and registration is disabled");
      }

      const tokenParts = accessToken.split(".");
      let uti: string | null = null;
      if (tokenParts.length === 3) {
        try {
          const payload = JSON.parse(Buffer.from(tokenParts[1], "base64").toString());
          uti = payload.uti || null;
        } catch {
          // UTI extraction failed
        }
      }

      return new SessionUser(user.id, user.email, user.name, userInfo.id, uti || undefined);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Microsoft Graph API error:", {
          status: error.response?.status,
          message: error.response?.data?.error?.message || error.message,
        });

        if (error.response?.status === 401) {
          throw new UnauthorizedException("Invalid or expired Azure AD token");
        }
        throw new UnauthorizedException("Failed to validate token with Microsoft Graph");
      }

      console.error("Unexpected error during token validation:", error);
      throw error;
    }
  }
}
