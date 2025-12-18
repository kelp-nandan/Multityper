import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const client: Socket = context.switchToWs().getClient<Socket>();
    const token = client.handshake.auth?.access_token;

    if (!token) {
      throw new UnauthorizedException('Invalid token');
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      client.data.user = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
      };

      return true;
    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}