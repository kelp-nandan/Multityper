import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../identity/services/auth.service';
import { IUser } from '../interfaces/auth.interfaces';
import { IRoom } from '../interfaces/room.interface';
import { Modal } from '../modal/modal';
import { HttpService } from '../services/http.service';
import { RoomService } from '../services/room.service';
import { SocketService } from '../services/socket.service';

@Component({
  selector: 'app-homepage',
  imports: [CommonModule, FormsModule, Modal],
  templateUrl: './homepage.html',
  styleUrls: ['./homepage.scss'],
})
export class HomePage implements OnInit {
  rooms$!: Observable<IRoom[]>;

  user = signal<IUser | null>(null);
  showDetails = signal(false);
  isLoading = signal(false);
  showJoinModal = signal(false);
  showCreateModal = signal(false);
  roomName = signal<string>('');
  userStats = signal<{ bestWpm: number; gamesPlayed: number; wins: number }>({
    bestWpm: 0,
    gamesPlayed: 0,
    wins: 0,
  });

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly socketService = inject(SocketService);
  private readonly roomService = inject(RoomService);
  private readonly httpService = inject(HttpService);

  constructor() {
    this.rooms$ = this.roomService.rooms$;
  }

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    const currentUser = this.authService.currentUser();
    if (currentUser) {
      const cleanUser = currentUser;
      this.user.set(cleanUser);
      this.fetchUserStats();
    } else {
      this.fetchUserProfile();
    }
  }

  fetchUserStats() {
    this.isLoading.set(true);
    this.httpService.getUserStats().subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.data) {
          const currentStats = this.user();
          if (currentStats) {
            this.userStats.set({
              bestWpm: response.data.bestWpm,
              gamesPlayed: response.data.gamesPlayed,
              wins: response.data.wins,
            });
          }
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        console.error('Error fetching user stats:', error);
      },
    });
  }

  trackByRoomId(index: number, room: IRoom): string {
    return room.key;
  }

  joinRoomModal(): void {
    this.showJoinModal.set(true);
  }

  createRoomModal(): void {
    this.showCreateModal.set(true);
  }

  handleJoinClose(): void {
    this.showJoinModal.set(false);
  }

  handleCreateClose(): void {
    this.showCreateModal.set(false);
  }

  handleCreateConfirm(): void {
    this.socketService.handleCreateRoom({ roomName: this.roomName() });
    this.showCreateModal.set(false);
    this.roomName.set('');
  }

  handleJoinRoom(room: IRoom): void {
    this.showJoinModal.set(false);
    this.socketService.handleJoinRoom(room.key);
  }

  fetchUserProfile(): void {
    this.isLoading.set(true);
    this.authService.getUserProfile().subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.data.user) {
          const cleanUser = response.data.user;
          this.user.set(cleanUser);
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.authService.logout();
      },
    });
  }

  onLogout(): void {
    if (confirm('Are you sure you want to logout?')) this.authService.logout();
  }
}
