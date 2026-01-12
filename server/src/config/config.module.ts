import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { Configuration } from "../models/configuration.model";
import { AuthConfigService } from "./auth-config.service";

@Module({
  imports: [SequelizeModule.forFeature([Configuration])],
  providers: [AuthConfigService],
  exports: [AuthConfigService],
})
export class ConfigModule {}
