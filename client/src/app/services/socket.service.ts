import { Injectable, NgZone } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { IRoom } from '../interfaces/room.interface';
import { RoomService } from './room.service';
import { SERVER_URL } from '../constants/index';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket;

  constructor(private roomService: RoomService, private ngZone: NgZone, private router: Router) {
    this.socket = io(SERVER_URL, {
      withCredentials: true
    });

    this.socket.on('connect', () => {
      this.handleGetAllRooms();
    });

    this.listenEvents();
  }

  private listenEvents() {
    this.socket.on('set-all-rooms', (data: IRoom[]) => {
      this.ngZone.run(() => {
        const rooms: IRoom[] = data;
        this.roomService.setRooms(rooms);
      });
    });

    this.socket.on('room-created-by-me', (item: IRoom) => {
      this.ngZone.run(() => {
        const room: IRoom = item;
        this.roomService.addRoom(room);
        this.roomService.selectRoom(room);
        this.router.navigate([`/rooms/${item.key}`]);
      });
    });

    this.socket.on('left-room-by-me', () => {
      this.roomService.clearSelectRoom();
      this.router.navigate(['/homepage']);
    });

    this.socket.on('new-room-available', (item: IRoom) => {
      this.ngZone.run(() => {
        const room: IRoom = item
        this.roomService.addRoom(room);
      });
    });

    this.socket.on('room-updated', (item: IRoom) => {
      this.ngZone.run(() => {
        let updatedRoom: IRoom = item;
        this.roomService.updateRoom(updatedRoom);
      });
    });

    this.socket.on('joined-room', (item: IRoom) => {
      this.ngZone.run(() => {
        const room: IRoom = item;
        this.roomService.selectRoom(room);
        this.router.navigate([`/rooms/${item.key}`]);
      });
    });


    this.socket.on('room-destroyed', (data: { roomId: string }) => {
      this.ngZone.run(() => {
        const currentRoom = this.roomService.getCurrentRoom();
        if (currentRoom && currentRoom.key === data.roomId) {
          this.roomService.clearSelectRoom();
          this.router.navigate(['/homepage']);
        }
        this.roomService.removeRoom(data.roomId);
      });
    });

    this.socket.on('game-started', (item: IRoom) => {
      this.ngZone.run(() => {
        let updatedRoom: IRoom;
        updatedRoom = item;
        this.roomService.updateRoom(updatedRoom);
        this.router.navigate(['/game-dashboard']);
      });
    });

    this.socket.on('lock-room', (item: IRoom) => {
      this.ngZone.run(() => {
        const currentRoom = this.roomService.getCurrentRoom();
        const roomId = item.key || (item as any).roomId;
        if (!currentRoom || currentRoom.key !== roomId) {
          this.roomService.removeRoom(roomId);
        } else {
          let updatedRoom: IRoom;
          updatedRoom = item;
          this.roomService.updateRoom(updatedRoom);
        }
      });
    });

    this.socket.on('join-room-error', (data: { message: string }) => {
      this.ngZone.run(() => {
        alert(data.message);
      });
    });
  }

  handleCreateRoom(data: { roomName: string }) {
    this.socket.emit('create-room', data);
  }

  handleJoinRoom(roomId: string) {
    this.socket.emit('join-room', { roomId });
  }

  handleLeaveRoom(roomId: string) {
    this.socket.emit('leave-room', { roomId });
  }

  handleDestroyRoom(roomId: string) {
    this.socket.emit('destroy-room', { roomId });
  }

  handleGetAllRooms() {
    this.socket.emit('get-all-rooms');
  }

  handleCountdown(roomId: string) {
    this.socket.emit('countdown', roomId);
  }

  handleRestoreRoom(roomId: string) {
    this.socket.emit('get-room', { roomId });
  }

  handleLiveProgress(roomId: string, percentage: number, wpm: number = 0, accuracy: number = 0) {
    this.socket.emit('live-progress', { progress: percentage, wpm, accuracy, roomId });
  }
  // Expose socket.on method for components with generic typing
  on<T = unknown>(event: string, callback: (data: T) => void): void {
    this.socket.on(event, (data: T) => {
      this.ngZone.run(() => callback(data));
    });
  }

  // Expose socket.off method for components
  off(event: string, callback?: (data: unknown) => void): void {
    this.socket.off(event, callback);
  }

  // General emit method for components with optional generic typing
  emit<T = unknown>(event: string, data?: T): void {
    this.socket.emit(event, data);
  }
}