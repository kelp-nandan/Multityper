import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';

import { AuthService } from '../../identity/services/auth.service';
import { IUser } from '../../interfaces/auth.interfaces';
import { IRoom } from '../../interfaces/room.interface';
import { RoomService } from '../../services/room.service';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-gamelobby',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gamelobby.html',
  styleUrls: ['./gamelobby.scss'],
})
export class GameLobby implements OnInit, OnDestroy {
  room$!: Observable<IRoom | null>;
  private currentUser: IUser | null;
  private subscriptions: Subscription[] = [];

  private readonly roomService = inject(RoomService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly socketService = inject(SocketService);
  private readonly route = inject(ActivatedRoute);

  constructor() {
    this.currentUser = this.authService.currentUser();
  }

  ngOnInit(): void {
    const roomId = this.route.snapshot.paramMap.get('_id');

    if (!roomId) {
      this.router.navigate(['/homepage']);
      return;
    }

    const currentRoom = this.roomService.getCurrentRoom();
    if (!currentRoom || currentRoom.key !== roomId) {
      this.socketService.handleRestoreRoom(roomId);
    }

    this.room$ = this.roomService.selectedRoom$;
  }

  isCreator(room: IRoom): boolean {
    const currentUser = this.authService.currentUser();
    const createdBy = room.data.players?.find(
      (p: { isCreated: boolean; userId: number }) => p.isCreated,
    );

    return createdBy?.userId === currentUser?.id;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  startRace(roomId: string): void {
    this.socketService.handleCountdown(roomId);
  }

  destroyRace(roomId: string): void {
    this.socketService.handleDestroyRoom(roomId);
    this.roomService.clearSelectRoom();
    this.router.navigate(['homepage']);
  }

  leaveRoom(roomId: string): void {
    this.socketService.handleLeaveRoom(roomId);
  }

  leaveBtnValidation(player: { userId: number; userName: string; isCreated: boolean }): boolean {
    return !player.isCreated && player.userId === this.currentUser?.id;
  }
}
