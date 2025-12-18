import { UseGuards } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WsJwtGuard } from 'src/auths/guards/ws-jwt.guard';

@WebSocketGateway({})
@UseGuards(WsJwtGuard)
export class ChatGateWay {
    @WebSocketServer()
    server: Server;
    @SubscribeMessage('testing')
    handleTesting(@MessageBody() msg: string, @ConnectedSocket() client: Socket) {
        console.log(`received ${msg} from the client: ${client.id}`);
    }
}