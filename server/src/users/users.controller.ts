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
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ENV } from '../config/env.config';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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
      if (error.message.includes('email already exists')) {
        throw new HttpException('Email already exists', HttpStatus.CONFLICT);
      } else if (error.message.includes('validation')) {
        throw new HttpException('Invalid input data', HttpStatus.UNPROCESSABLE_ENTITY);
      } else {
        throw new HttpException('Registration failed', HttpStatus.INTERNAL_SERVER_ERROR);
      }
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
      if (
        error.message.includes('invalid credentials') ||
        error.message.includes('Invalid credentials')
      ) {
        throw new HttpException('Invalid email or password', HttpStatus.UNAUTHORIZED);
      } else if (error.message.includes('validation')) {
        throw new HttpException('Invalid input format', HttpStatus.UNPROCESSABLE_ENTITY);
      } else {
        throw new HttpException('Login failed', HttpStatus.INTERNAL_SERVER_ERROR);
      }
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
      throw new HttpException('Failed to retrieve users', HttpStatus.INTERNAL_SERVER_ERROR);
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
      throw new HttpException('Failed to retrieve profile', HttpStatus.INTERNAL_SERVER_ERROR);
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

      if (error.message.includes('expired') || error.message.includes('invalid')) {
        throw new HttpException('Invalid or expired refresh token', HttpStatus.UNAUTHORIZED);
      } else {
        throw new HttpException('Token refresh failed', HttpStatus.INTERNAL_SERVER_ERROR);
      }
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
