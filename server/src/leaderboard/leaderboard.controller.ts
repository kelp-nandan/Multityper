import { Controller, UseGuards, Request, Get } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import type { IUserRequest } from "src/interfaces/response.interface";
import { LeaderboardService } from "./leaderboard.service";

@Controller("api/leaderboard")
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) { }

  @Get("getStats")
  @UseGuards(JwtAuthGuard)
  async handleFetchStats(@Request() req: IUserRequest) {
    return await this.leaderboardService.fetchStats(req.user.id);
  }
}
