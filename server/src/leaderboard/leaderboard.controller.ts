import { Body, Controller, UseGuards, Request, Get, UnauthorizedException } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { LeaderboardService } from "./leaderboard.service";

@Controller("api/leaderboard")
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}
  @Get("getStats")
  @UseGuards(JwtAuthGuard)
  handleFetchStats(@Request() req: { user: { id: number; email: string; name: string } }) {
    try {
      if (!req.user) {
        throw new UnauthorizedException();
      }
      const data = this.leaderboardService.fetchStats(req.user.id);
      return data;
    } catch (error) {
      console.log(error);
    }
  }
}
