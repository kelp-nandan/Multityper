import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
  ValidationPipe,
  Res,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ENV } from '../config/env.config';
import { ErrorHandler } from '../common/error-handler';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post('register')
  async register(
    @Body(ValidationPipe) createUserDto: CreateUserDto,
    @Res({ passthrough: true }) response: any,
  ) {
    try {
      const user = await this.usersService.register(createUserDto);
      const { accessToken, refreshToken } = await this.usersService.generateTokensForUser(user.id);

      response.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: ENV.isProduction(),
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000,
      });

      response.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: ENV.isProduction(),
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return {
        message: 'User registered successfully',
        data: { user },
      };
    } catch (error) {
      ErrorHandler.handleError(error, 'Registration failed');
    }
  }

  @Post('login')
  async login(
    @Body(ValidationPipe) loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) response: any,
  ) {
    try {
      const { user, accessToken, refreshToken } = await this.usersService.login(loginUserDto);

      response.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: ENV.isProduction(),
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000,
      });

      response.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: ENV.isProduction(),
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return {
        message: 'Login successful',
        data: { user },
      };
    } catch (error) {
      ErrorHandler.handleError(error, 'Login failed');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll() {
    try {
      const users = await this.usersService.findAll();
      return {
        message: 'Users retrieved successfully',
        data: users,
      };
    } catch (error) {
      ErrorHandler.handleError(error, 'Failed to retrieve users');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    try {
      return {
        message: 'Profile retrieved successfully',
        data: {
          user: req.user,
        },
      };
    } catch (error) {
      ErrorHandler.handleError(error, 'Failed to retrieve profile');
    }
  }

  @Post('refresh')
  async refreshToken(@Req() request: any, @Res({ passthrough: true }) response: any) {
    const refreshToken = request.cookies?.refresh_token;

    if (!refreshToken) {
      throw new HttpException('Refresh token not found', HttpStatus.UNAUTHORIZED);
    }

    try {
      const { accessToken } = await this.usersService.refreshAccessToken(refreshToken);

      response.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: ENV.isProduction(),
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000,
      });

      return {
        message: 'Token refreshed successfully',
      };
    } catch (error) {
      response.clearCookie('access_token');
      response.clearCookie('refresh_token');
      ErrorHandler.handleError(error, 'Token refresh failed');
    }
  }

  @Post('logout')
  async logout(@Req() request: any, @Res({ passthrough: true }) response: any) {
    try {
      const refreshToken = request.cookies?.refresh_token;

      if (refreshToken) {
        await this.usersService.revokeRefreshToken(refreshToken);
      }

      response.clearCookie('access_token');
      response.clearCookie('refresh_token');

      return {
        message: 'Logged out successfully',
      };
    } catch (error) {
      response.clearCookie('access_token');
      response.clearCookie('refresh_token');

      return {
        message: 'Logged out successfully',
      };
    }
  }
}
