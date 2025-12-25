import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { ParagraphController } from "./paragraph.controller";
import { ParagraphService } from "./paragraph.service";

@Module({
  imports: [DatabaseModule],
  controllers: [ParagraphController],
  providers: [ParagraphService],
  exports: [ParagraphService],
})
export class ParagraphModule {}
