import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer
} from '@nestjs/websockets';
import { UseGuards, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';
import { RedisService } from '../redis/redis.service';
import { ParagraphService } from '../paragraph/paragraph.service';
import { wsConfig } from '../config/wsConfig';
import { WsException } from '@nestjs/websockets';
import { v4 as uuid4 } from 'uuid';

interface IPlayerStats {
  wpm: number;
  accuracy: number;
  totalMistakes: number;
  timeTakenSeconds: number;
}

@WebSocketGateway(wsConfig)
@UseGuards(WsJwtGuard)
export class RoomGateWay {
  private readonly logger = new Logger(RoomGateWay.name);

  constructor(
    private redisService: RedisService,
    private paragraphService: ParagraphService
  ) { }
  @WebSocketServer()
  server: Server;

  @SubscribeMessage("create-room")
  async handleCreateRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() name: { roomName: string },
  ) {
    const roomId = uuid4();
    try {
      await this.redisService.setRoom({
        key: roomId,
        data: {
          roomName: name.roomName,
          players: [
            {
              userId: client.data.user.id,
              userName: client.data.user.name,
              isCreated: true,
            },
          ],
          gameStarted: false,
        }
      });
      const newRoom = await this.redisService.getRoom(roomId);
      await client.join(roomId);
      client.emit("room-created-by-me", {
        key: roomId,
        data: newRoom,
      });
      client.broadcast.emit("new-room-available", {
        key: roomId,
        data: newRoom,
      });
    } catch (err) {
      this.logger.error('Error creating room', err);
    }
  }

  @SubscribeMessage('leave-room')
  async handleLeaveRoom(@ConnectedSocket() client: Socket, @MessageBody() data: { roomId: string }) {
    try{
      const roomData = await this.redisService.getRoom(data.roomId);
      const userId = client.data.user.id;
      
      const updatedplayers = roomData?.players.filter((player) => {
        return (player.userId !== userId);
      });

      roomData.players = updatedplayers;
      await this.redisService.setRoom({
        key: data.roomId,
        data: roomData
      });

      await client.leave(data.roomId);
      client.emit('left-room-by-me');
      client.to(data.roomId).emit('room-updated', { key: data.roomId, data: roomData });
      this.server.emit('room-updated', roomData);
    } catch (err) {
      this.logger.error('Error creating room', err);
    }
  }

  @SubscribeMessage("get-room")
  async handleGetRooms(@MessageBody() data: {roomId: string}, @ConnectedSocket() client: Socket) {
    const roomData = await this.redisService.getRoom(data.roomId);
    if(!roomData) {
      client.emit("join-room-error", {
        message: "Room does not exist"
      });
      return;
    }
    if (!roomData.players.some(p => p.userId === client.data.user.id)) {
      client.emit("join-room-error", { message: "Not authorized" });
      return;
    }
    await client.join(data.roomId);
    client.emit("joined-room", { key: data.roomId, data: roomData});
  }

  @SubscribeMessage("join-room")
  async handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() data: { roomId: string }) {
    try {
      const user = client.data.user;
      const roomData = await this.redisService.getRoom(data.roomId);
      if (!roomData) {
        client.emit("join-room-error", {
          message: "Room does not exist"
        });
        return;
      };
      if(roomData.players.length >= 5) {
        client.emit("join-room-error", {
          message: "Room is full. Maximum 5 players allowed"
        });
        return;
      }
      if(roomData.gameStarted) {
        client.emit("join-room-error", {
          message: "Game is already started in this room"
        });
        return;
      }
      const players = roomData.players || [];
      const existingIndex = players.findIndex(player => {
        return player.userId === user.id || player.userName === user.name;
      });
      if (existingIndex === -1) {
        players.push({
          userId: user.id,
          userName: user.name,
          isCreated: false,
        });
      } else {
        const existing = players[existingIndex];
        existing.userId = user.id;
        existing.userName = user.name;
        existing.isCreated = existing.isCreated || false;
        players[existingIndex] = existing;
      }

      roomData.players = players;
      await this.redisService.setRoom({
        key: data.roomId,
        data: roomData
      });
      await client.join(data.roomId);
      client.emit("joined-room", { key: data.roomId, data: roomData });
      client.to(data.roomId).emit("room-updated", { key: data.roomId, data: roomData });
    } catch (err) {
      this.logger.error('Error joining room', err);
      client.emit("join-room-error", { message: "Failed to join room" });
    }
  }

  @SubscribeMessage("destroy-room")
  async handleDestroyRoom(@MessageBody() data: { roomId: string }) {
    await this.redisService.deleteRoom(data.roomId);
    this.server.emit("room-destroyed", { roomId: data.roomId });
  }

  @SubscribeMessage("get-all-rooms")
  async handlegetAllrooms(@ConnectedSocket() client: Socket) {
    const data = await this.redisService.getAllRooms();
    client.emit("set-all-rooms", data);
  }



  @SubscribeMessage("countdown")
  async handleCountdown(@ConnectedSocket() client: Socket, @MessageBody() roomId: string) {
    const userId = client.data.user.id;
    const roomData = await this.redisService.getRoom(roomId);

    if (!roomData) {
      throw new WsException("Room not found");
    }

    const isCreator = roomData.players.some(
      player => player.userId === userId && player.isCreated === true
    );

    if (!isCreator) {
      throw new WsException("Only room creator can start the game");
    }

    // Lock the room so no new players can join
    roomData.gameStarted = true;
    await this.redisService.setRoom({
      key: roomId, 
      data: roomData
    });

    // Emit lock-room event to all clients
    this.server.emit('lock-room', { key: roomId, data: roomData });

    // Emit game-started to room participants to navigate them
    this.server.to(roomId).emit("game-started", { key: roomId, data: roomData });

    // Start 10-second countdown
    setTimeout(async () => {
      try {
        // Get random paragraph after countdown
        const paragraph = await this.paragraphService.getRandomParagraph();

        // Update room data with paragraph
        const updatedRoomData = await this.redisService.getRoom(roomId);
        if (updatedRoomData) {
          // Emit paragraph to all players in the room
          this.server.to(roomId).emit("paragraph-ready", {
            roomId,
            paragraph: paragraph.content,
            paragraphId: paragraph.id
          });
        }
      } catch (error) {
        this.logger.error('Error fetching paragraph', error);
        this.server.to(roomId).emit("game-error", {
          message: "Failed to load game content"
        });
      }
    }, 10000);
  }


  @SubscribeMessage("player-finished")
  handlePlayerFinished(@ConnectedSocket() client: Socket, @MessageBody() data: { stats: IPlayerStats }) {
    const userId = client.data.user.id;

    // Broadcast the completion to other players for real-time leaderboards
    // In the next step, we will store this in Redis to aggregate final results
    this.server.emit("player-completed-run", {
      userId,
      userName: client.data.user.name,
      stats: data.stats
    });
  }

  @SubscribeMessage("live-progress")
  async handleLiveProgress(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { progress: number; wpm?: number; accuracy?: number; roomId: string }
  ) {
    try {
      const userId = client.data.user.id;

      const roomData = await this.redisService.getRoom(data.roomId);
      if (!roomData) {
        throw new WsException("Room does not exist");
      }

      const playerIndex = roomData.players.findIndex(
        p => p.userId === userId
      );

      if (playerIndex === -1) {
        throw new WsException("Not authorized for this room");
      }

      if (data.progress < 0 || data.progress > 100) {
        throw new WsException("Progress must be between 0 and 100");
      }

      if (!roomData.players[playerIndex].stats) {
        roomData.players[playerIndex].stats = {};
      }

      roomData.players[playerIndex].stats.progress = data.progress;
      if (data.wpm !== undefined) {
        roomData.players[playerIndex].stats.wpm = data.wpm;
      }
      if (data.accuracy !== undefined) {
        roomData.players[playerIndex].stats.accuracy = data.accuracy;
      }

      await this.redisService.setRoom({
        key: data.roomId,
        data: roomData,
      });

      this.server.to(data.roomId).emit("room-updated", {
        key: data.roomId,
        data: roomData,
      });

    } catch (error) {
      console.log(error);
    }
  }

}