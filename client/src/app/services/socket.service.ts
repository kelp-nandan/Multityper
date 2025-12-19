import { Injectable, NgZone } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Room } from '../interfaces/room.interface';
import { RoomService } from './room.service';
import {SERVER_URL} from '../constants/index';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket;

  constructor(private roomService: RoomService, private ngZone: NgZone) {
    this.socket = io(SERVER_URL, {
      withCredentials: true
    });
    this.socket.on('connect', () => {
        this.handleGetAllRooms();
    })
    this.listenEvents();
  }


  private listenEvents() {
    

    this.socket.on('set-all-rooms', (data: any[]) => {
      this.ngZone.run(() => {
        const rooms: Room[] = data.map((item) => ({
          roomId: item.key,
          roomName: item.data.roomName,
          players: item.data.players,
        }));

        this.roomService.setRooms(rooms);
      });
    });

    this.socket.on('created-room', (item: any) => {
      this.ngZone.run(() => {
        const room: Room = {
          roomId: item.key,
          roomName: item.data.roomName,
          players: item.data.players,
        };

        this.roomService.addRoom(room);
      });
    });

    this.socket.on('room-updated', (item: any) => {
      this.ngZone.run(() => {
        
        let updatedRoom: Room;
        if (item.key && item.data) {
          updatedRoom = {
            roomId: item.key,
            roomName: item.data.roomName,
            players: item.data.players,
          };
        } else {
          updatedRoom = item;
        }
        
        this.roomService.updateRoom(updatedRoom);
      });
    });

    this.socket.on('room-destroyed', (data: {roomId: string}) => {
      this.ngZone.run(() => {
        this.roomService.removeRoom(data.roomId);
        this.roomService.clearSelectRoom();
      })
    });

  }

  handleCreateRoom(data: { roomName: string }){
    this.socket.emit('create-room', data);
  }
  
  handleJoinRoom(roomId: string) {
    console.log(roomId);
    this.socket.emit('join-room', { roomId });
  }

  handleDestroyRoom(roomId: string) {
    this.socket.emit('destroy-room', { roomId });
  }

  handleGetAllRooms(){
    this.socket.emit('get-all-rooms');
  }

}
 