import { Module } from "@nestjs/common";
import { AuthModule } from "src/auth/auth.module";
import { ConfigModule } from "src/config/config.module";
import { DatabaseModule } from "src/database/database.module";
import { LeaderboardController } from "./leaderboard.controller";
import { LeaderboardService } from "./leaderboard.service";

@Module({
  imports: [DatabaseModule, ConfigModule, AuthModule],
  controllers: [LeaderboardController],
  providers: [LeaderboardService],
  exports: [LeaderboardService],
})
export class LeaderboardModule {}
