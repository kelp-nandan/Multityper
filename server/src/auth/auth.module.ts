import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { SequelizeModule } from "@nestjs/sequelize";
import { ConfigModule } from "../config/config.module";
import { User } from "../models/user.model";
import { RedisModule } from "../redis/redis.module";
import { UsersModule } from "../users/users.module";
import { AuthController } from "./auth.controller";
import { AzureAdGuard } from "./guards/azure-ad.guard";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { LocalJwtGuard } from "./guards/local-jwt.guard";
import { AzureADStrategy } from "./strategy/azure-ad.strategy";
import { LocalJwtStrategy } from "./strategy/jwt.strategy";
import { TokenController } from "./token.controller";

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || "secret-key",
      signOptions: { expiresIn: "15m" },
    }),
    SequelizeModule.forFeature([User]),
    UsersModule,
    RedisModule,
    ConfigModule,
  ],
  controllers: [AuthController, TokenController],
  providers: [LocalJwtStrategy, AzureADStrategy, JwtAuthGuard, LocalJwtGuard, AzureAdGuard],
  exports: [JwtModule, JwtAuthGuard, LocalJwtGuard, AzureAdGuard],
})
export class AuthModule {}
