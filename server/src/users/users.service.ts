import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { JWT_ACCESS_TOKEN_EXPIRY, JWT_REFRESH_TOKEN_EXPIRY } from "../constants";
import { UserRepository } from "../database/repositories";
import { IJwtPayload, IRefreshTokenPayload } from "../interfaces/auth.interface";
import { CreateUserDto } from "./dto/create-user.dto";
import { LoginUserDto } from "./dto/login-user.dto";
import { IcreateAzureUserDto, IUser, IUserProfile } from "./interfaces";

@Injectable()
export class UsersService {
  constructor(
    private jwtService: JwtService,
    private userRepository: UserRepository,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<IUserProfile> {
    const { name, email, password } = createUserDto;

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error("email already exists");
    }

    const saltRounds = 12;
    const serverHash = await bcrypt.hash(password, saltRounds);

    const newUser = await this.userRepository.create({
      name,
      email,
      password: serverHash,
    });
    return newUser;
  }

  async login(LoginUserDto: LoginUserDto): Promise<{
    user: IUserProfile;
    accessToken: string;
    refreshToken: string;
  }> {
    const { email, password } = LoginUserDto;

    const user = await this.userRepository.findByEmailForAuth(email);
    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const payload = {
      email: user.email,
      id: user.id,
      name: user.name,
    };
    const accessToken = this.jwtService.sign(payload, { expiresIn: "15m" });
    const refreshToken = this.generateRefreshToken(user.id);

    const userProfile: IUserProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      wins: user.wins ?? 0,
      gamesPlayed: user.gamesPlayed ?? 0,
      bestWpm: user.bestWpm ?? 0,
      created_at: user.created_at,
      updated_at: user.updated_at,
      created_by: user.created_by,
      updated_by: user.updated_by,
    };

    delete (userProfile as any).password;

    return {
      user: userProfile,
      accessToken,
      refreshToken,
    };
  }

  private generateRefreshToken(userId: number): string {
    const refreshPayload: IRefreshTokenPayload = {
      id: userId,
    };
    return this.jwtService.sign(refreshPayload, { expiresIn: JWT_REFRESH_TOKEN_EXPIRY });
  }

  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const decoded = this.jwtService.verify<IRefreshTokenPayload>(refreshToken);

      const user = await this.userRepository.findById(decoded.id);
      if (!user) {
        throw new UnauthorizedException("User not found");
      }

      const payload: IJwtPayload = {
        email: user.email,
        id: user.id,
        name: user.name,
      };
      const accessToken = this.jwtService.sign(payload, { expiresIn: JWT_ACCESS_TOKEN_EXPIRY });

      return { accessToken };
    } catch (_error) {
      throw new UnauthorizedException("Invalid or expired refresh token");
    }
  }

  async findById(userId: number): Promise<IUserProfile | null> {
    return await this.userRepository.findById(userId);
  }

  async findAll(): Promise<IUserProfile[]> {
    return await this.userRepository.findAll();
  }

  async generateTokensForUser(
    userId: number,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    const payload = {
      email: user.email,
      id: user.id,
      name: user.name,
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: JWT_ACCESS_TOKEN_EXPIRY });
    const refreshToken = this.generateRefreshToken(user.id);

    return { accessToken, refreshToken };
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return await this.userRepository.findByEmailForAuth(email);
  }

  async createAzureUser(dto: IcreateAzureUserDto): Promise<IUserProfile> {
    return await this.userRepository.create({
      email: dto.email,
      name: dto.name,
      password: "",
      azureOid: dto.azureOid,
      azureTenantId: dto.azureTenantId,
    });
  }
}
