import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';

import { AuthService } from '../../identity/services/auth.service';
import { IRoom, IUser } from '../../interfaces';
import { RoomService } from '../../services/room.service';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-gamelobby',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gamelobby.html',
  styleUrls: ['./gamelobby.scss'],
})
export class Gamelobby implements OnInit {
  room$!: Observable<IRoom | null>;
  isCreator = signal<boolean>(false);
  private currentUser: IUser | null;
  roomDetails = signal<IRoom | null>(null);

  constructor(
    private roomService: RoomService,
    private authService: AuthService,
    private router: Router,
    private socketService: SocketService,
    private route: ActivatedRoute,
  ) {
    this.currentUser = this.authService.currentUser();
  }

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    const roomId = this.route.snapshot.paramMap.get('_id');

    if (!roomId) {
      this.router.navigate(['/homepage']);
      return;
    }
    this.socketService.handleRestoreRoom(roomId);
    this.room$ = this.roomService.selectedRoom$;

    this.roomService.selectedRoom$.subscribe((room: IRoom | null) => {
      if (room) {
        this.roomDetails.set(room);
        const currentUser = this.authService.currentUser();
        const createdBy = room.data.players?.find((p: { isCreated: boolean; userId: number }) => p.isCreated);
        this.isCreator.set(createdBy?.userId === currentUser?.id);
      }
    });
  }

  startRace(roomId: string) {
    this.socketService.handleCountdown(roomId);
  }

  destroyRace(roomId: string) {
    this.socketService.handleDestroyRoom(roomId);
    this.roomService.clearSelectRoom();
    this.router.navigate(['homepage']);
  }

  leaveRoom(roomId: string) {
    this.socketService.handleLeaveRoom(roomId);
  }

  leaveBtnValidation(player: { userId: number; userName: string; isCreated: boolean }) {
    return (
      !player.isCreated &&
      player.userId === this.currentUser?.id &&
      !this.roomDetails()?.data.gameStarted
    );
  }
}
