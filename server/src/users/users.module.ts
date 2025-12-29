import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { JWT_ACCESS_TOKEN_EXPIRY } from "src/constants";
import { DatabaseModule } from "src/database/database.module";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";

@Module({
  imports: [
    DatabaseModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get<string>("jwt.secret"),
          signOptions: {
            expiresIn: JWT_ACCESS_TOKEN_EXPIRY,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule { }
