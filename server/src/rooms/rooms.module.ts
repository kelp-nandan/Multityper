import { Module } from "@nestjs/common";
import { AuthModule } from "src/auth/auth.module";
import { WsJwtGuard } from "src/auth/guards/ws-jwt.guard";
import { DatabaseModule } from "src/database/database.module";
import { RedisModule } from "src/redis/redis.module";
import { ParagraphModule } from "../paragraph/paragraph.module";
import { RoomGateWay } from "./rooms.gateway";

@Module({
  imports: [RedisModule, AuthModule, DatabaseModule, ParagraphModule],
  providers: [RoomGateWay, WsJwtGuard],
})
export class RoomsModule {}
