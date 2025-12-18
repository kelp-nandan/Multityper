import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ChatGateWay } from './chat.gateway';

@Module({
    providers: [JwtService, ChatGateWay]
})
export class ChatModule {}
