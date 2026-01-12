import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
  ValidationPipe,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { ErrorHandler } from "../common/error-handler";
import { AuthConfigService } from "../config/auth-config.service";
import { ACCESS_TOKEN_MAX_AGE, REFRESH_TOKEN_MAX_AGE } from "../constants";
import { IAuthSuccessResponse } from "../interfaces/response.interface";
import { RedisService } from "../redis/redis.service";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { LoginUserDto } from "../users/dto/login-user.dto";
import { UsersService } from "../users/users.service";
import { CurrentUser } from "./decorators/current-user.decorator";
import { Public } from "./decorators/public.decorator";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { SessionUser } from "./session-user";
import { TokenExtractor } from "./utils/token-extractor";
import { UtiExtractor } from "./utils/uti-extractor";

@Controller("api/auth")
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly redisService: RedisService,
    private readonly authConfigureService: AuthConfigService,
  ) {}

  @Public()
  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body(ValidationPipe) createUserDto: CreateUserDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<IAuthSuccessResponse> {
    try {
      const user = await this.usersService.register(createUserDto);
      const { accessToken, refreshToken } = await this.usersService.generateTokensForUser(user.id);

      response.cookie("access_token", accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: ACCESS_TOKEN_MAX_AGE,
      });

      response.cookie("refresh_token", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: REFRESH_TOKEN_MAX_AGE,
      });

      return {
        message: "User registered successfully",
        data: { user },
      };
    } catch (error) {
      ErrorHandler.handleError(error, "Registration failed");
    }
  }

  @Public()
  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(
    @Body(ValidationPipe) loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<IAuthSuccessResponse> {
    try {
      const { user, accessToken, refreshToken } = await this.usersService.login(loginUserDto);

      response.cookie("access_token", accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: ACCESS_TOKEN_MAX_AGE,
      });

      response.cookie("refresh_token", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: REFRESH_TOKEN_MAX_AGE,
      });

      return {
        message: "Login successful",
        data: { user },
      };
    } catch (error) {
      ErrorHandler.handleError(error, "Login failed");
    }
  }

  @Public()
  @Post("logout")
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ message: string }> {
    try {
      const authStrategy = this.authConfigureService.getAuthStrategy();

      if (authStrategy === "local") {
        const accessToken = TokenExtractor.extractToken(request);
        if (accessToken) {
          await this.redisService.blacklistToken(accessToken, "access");
        }

        const refreshToken = TokenExtractor.extractRefreshToken(request);
        if (refreshToken) {
          await this.redisService.blacklistToken(refreshToken, "refresh");
        }
      } else {
        const authHeader = request.headers.authorization;
        if (authHeader) {
          const token = UtiExtractor.extractTokenFromHeader(authHeader);
          if (token) {
            const uti = UtiExtractor.extractUti(token);
            if (uti) {
              await this.redisService.blacklistToken(uti, "uti");
            }
          }
        }
      }

      response.clearCookie("access_token");
      response.clearCookie("refresh_token");

      return { message: "Logged out successfully" };
    } catch (error) {
      ErrorHandler.handleError(error, "Logout failed");
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get("profile")
  async getProfile(
    @CurrentUser() user: SessionUser,
  ): Promise<{ data: { user: { id: number; email: string; name: string } } }> {
    return {
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
    };
  }
  @UseGuards(JwtAuthGuard)
  @Post("blacklist-azure-token")
  @HttpCode(HttpStatus.OK)
  async blacklistAzureToken(@Req() request: Request): Promise<{ message: string }> {
    const authHeader = request.headers.authorization;
    if (authHeader) {
      const token = UtiExtractor.extractTokenFromHeader(authHeader);
      if (token) {
        const uti = UtiExtractor.extractUti(token);
        if (uti) {
          await this.redisService.blacklistToken(uti, "uti");
          return { message: "Token blacklisted successfully" };
        }
      }
    }
    throw new Error("Unable to extract token UTI");
  }
}
