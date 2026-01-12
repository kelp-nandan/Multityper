import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { ConfigModule } from "../config/config.module";
import { DatabaseModule } from "../database/database.module";
import { ParagraphController } from "./paragraph.controller";
import { ParagraphService } from "./paragraph.service";

@Module({
  imports: [DatabaseModule, ConfigModule, AuthModule],
  controllers: [ParagraphController],
  providers: [ParagraphService],
  exports: [ParagraphService],
})
export class ParagraphModule {}
