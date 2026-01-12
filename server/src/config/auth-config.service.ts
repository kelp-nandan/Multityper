import { Injectable, OnModuleInit } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Configuration } from "../models/configuration.model";

export type AuthStrategy = "local" | "azure";

@Injectable()
export class AuthConfigService implements OnModuleInit {
  private authStrategy: AuthStrategy = "local";
  private allowUserRegistration: boolean = true;

  constructor(
    @InjectModel(Configuration)
    private configurationModel: typeof Configuration,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.loadConfiguration();
  }

  private async loadConfiguration(): Promise<void> {
    try {
      const authStrategyConfig = await this.configurationModel.findOne({
        where: { key: "authStrategy" },
      });

      const registrationConfig = await this.configurationModel.findOne({
        where: { key: "allowUserRegistration" },
      });

      if (authStrategyConfig) {
        this.authStrategy = authStrategyConfig.value as AuthStrategy;
      }

      if (registrationConfig) {
        this.allowUserRegistration = registrationConfig.value === "true";
      }
    } catch (error) {
      //fallback to env
      this.authStrategy = (process.env.AUTH_STRATEGY as AuthStrategy) || "local";
      this.allowUserRegistration = process.env.ALLOW_USER_REGISTRATION === "true";
    }
  }

  getAuthStrategy(): AuthStrategy {
    return this.authStrategy;
  }

  getAllowUserRegistration(): boolean {
    return this.allowUserRegistration;
  }

  async setAuthStrategy(strategy: AuthStrategy): Promise<void> {
    await this.configurationModel.update({ value: strategy }, { where: { key: "authStrategy" } });
    this.authStrategy = strategy;
  }

  async setAllowUserRegistration(allow: boolean): Promise<void> {
    await this.configurationModel.update(
      { value: allow.toString() },
      { where: { key: "allowUserRegistration" } },
    );
    this.allowUserRegistration = allow;
  }

  getMsalConfig(): { tenantId: string; clientId: string; clientSecret: string; authority: string } {
    return {
      tenantId: process.env.MSAL_TENANT_ID || "",
      clientId: process.env.MSAL_CLIENT_ID || "",
      clientSecret: process.env.MSAL_CLIENT_SECRET || "",
      authority: `https://login.microsoftonline.com/${process.env.MSAL_TENANT_ID}`,
    };
  }
}
