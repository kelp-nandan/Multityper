import { Module } from "@nestjs/common";
import { ConfigModule as NestConfigModule } from "@nestjs/config";
import { SequelizeModule } from "@nestjs/sequelize";
import { ConfigModule } from "./config/config.module";

import { AppController } from "./app.controller";
import { AuthModule } from "./auth/auth.module";
import configuration from "./config/configuration";
import { ENV } from "./config/env.config";
import { DatabaseModule } from "./database/database.module";
import { LeaderboardModule } from "./leaderboard/leaderboard.module";
import { Configuration } from "./models/configuration.model";
import { ParagraphModule } from "./paragraph/paragraph.module";
import { RedisModule } from "./redis/redis.module";
import { RoomsModule } from "./rooms/rooms.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    NestConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    SequelizeModule.forRoot({
      dialect: "postgres",
      host: ENV.DATABASE_HOST,
      port: ENV.DATABASE_PORT,
      username: ENV.DATABASE_USER,
      password: ENV.DATABASE_PASSWORD,
      database: ENV.DB_NAME,
      models: [Configuration],
      autoLoadModels: false,
      synchronize: false,
      logging: false,
    }),
    DatabaseModule,
    UsersModule,
    AuthModule,
    RoomsModule,
    RedisModule,
    ParagraphModule,
    LeaderboardModule,
    ConfigModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
