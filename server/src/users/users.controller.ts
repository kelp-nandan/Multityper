import { Controller, Get, Request, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ErrorHandler } from "../common/error-handler";
import type { IUserRequest, IUsersListResponse, IUserProfileResponse } from "../interfaces/response.interface";
import { UsersService } from "./users.service";
@Controller("api/users")
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(): Promise<IUsersListResponse> {
    try {
      const users = await this.usersService.findAll();
      return {
        message: "Users retrieved successfully",
        data: users,
      };
    } catch (error) {
      ErrorHandler.handleError(error, "Failed to retrieve users");
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get("profile")
  getProfile(@Request() req: IUserRequest): IUserProfileResponse {
    try {
      return {
        message: "Profile retrieved successfully",
        data: {
          user: req.user,
        },
      };
    } catch (error) {
      ErrorHandler.handleError(error, "Failed to retrieve profile");
    }
  }
}
