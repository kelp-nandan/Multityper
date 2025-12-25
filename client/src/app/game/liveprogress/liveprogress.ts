import { CommonModule } from '@angular/common';
import { Component, NgZone, OnDestroy, OnInit, signal } from '@angular/core';

import { IPlayerData, IRoom } from '../../interfaces';
import { RoomService } from '../../services/room.service';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-liveprogress',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './liveprogress.html',
  styleUrl: './liveprogress.scss',
})
export class Liveprogress implements OnInit, OnDestroy {
  playersProgress = signal<IPlayerData[]>([]);

  constructor(
    private roomService: RoomService,
    private socket: SocketService,
    private ngZone: NgZone,
  ) { }

  ngOnInit() {
    // Initialize with current room players
    const room = this.roomService.getCurrentRoom();
    if (room?.data?.players) {
      this.playersProgress.set(room.data.players);
    }

    // Listen for room updates (progress comes through this event)
    this.socket.on<IRoom>('room-updated', (updatedRoom: IRoom) => {
      this.ngZone.run(() => {
        if (updatedRoom?.data?.players) {
          this.playersProgress.set(updatedRoom.data.players);
        }
      });
    });
  }

  ngOnDestroy() {
    this.socket.off('room-updated');
  }
}
