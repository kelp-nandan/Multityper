import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { IRoom } from '../interfaces/room.interface';
import { AuthService } from '../identity/services/auth.service';
import { RoomService } from '../services/room.service';
import { SocketService } from '../services/socket.service';
import { IUser } from '../interfaces';

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
  private currentUser : IUser | null;
  roomDetails = signal<IRoom | null>(null);

  constructor(
    private roomService: RoomService, 
    private authService : AuthService, 
    private router: Router,
    private socketService: SocketService,
    private route : ActivatedRoute
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
    
    this.roomService.selectedRoom$.subscribe((room) => {
      if (room) {
        this.roomDetails.set(room);
        const currentUser = this.authService.currentUser();
        const createdBy = room.data.players?.find((p) => p.isCreated);
        this.isCreator.set(
          createdBy?.userName === currentUser?.name
        );
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

  leaveBtnValidation(player: {userId: number, userName: string, isCreated: boolean}) {
    return !player.isCreated && player.userId === this.currentUser?.id && !this.roomDetails()?.data.gameStarted;
  }
}

