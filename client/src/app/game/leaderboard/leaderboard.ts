import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import confetti from 'canvas-confetti';

import { Router } from '@angular/router';
import { CONFETTI_DURATION, ILeaderboardDisplay, IPlayerData } from '../../interfaces';
import { RoomService } from '../../services/room.service';

class Player {
  username: string;
  wpm: number;
  accuracy: number;
  time: number;
  Total_Wrong: number;

  constructor(username: string, wpm: number, accuracy: number, time: number, Total_Wrong: number) {
    this.username = username;
    this.wpm = wpm;
    this.accuracy = accuracy;
    this.time = time;
    this.Total_Wrong = Total_Wrong;
  }
}

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './leaderboard.html',
  styleUrl: './leaderboard.scss',
})
export class Leaderboard implements OnInit {
  players: ILeaderboardDisplay[] = [];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private roomService: RoomService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.loadFinalResults();
    this.animationPopper();
  }

  loadFinalResults(): void {
    // First try to get results from query parameters (from redirect)
    this.route.queryParams.subscribe((params) => {
      if (params['results']) {
        try {
          const results = JSON.parse(params['results']);
          this.players = results
            .map((p: IPlayerData) => ({
              username: p.userName,
              wpm: p.stats?.wpm || 0,
              accuracy: p.stats?.accuracy || 0,
              time: p.stats?.timeTakenSeconds || 0,
              Total_Wrong: p.stats?.totalMistakes || 0,
            }))
            .sort((a: ILeaderboardDisplay, b: ILeaderboardDisplay) => b.wmp - a.wmp);
          return;
        } catch (error) {
          console.error('Error parsing results from query params:', error);
        }
      }

      // Fallback: get from room service
      const room = this.roomService.getCurrentRoom();
      if (room && room.data.players) {
        //mapping and sorting the player based on highest
        this.players = room.data.players
          .map((p: IPlayerData) => ({
            username: p.userName,
            wmp: p.stats?.wpm || 0,
            accuracy: p.stats?.accuracy || 0,
            time: p.stats?.timeTakenSeconds || 0,
            Total_Wrong: p.stats?.totalMistakes || 0,
          }))
          .sort((a: ILeaderboardDisplay, b: ILeaderboardDisplay) => b.wmp - a.wmp);
      }
    });
  }

  goHome(): void {
    this.router.navigate(['/homepage']);
  }

  animationPopper(): void {
    // Only run confetti animation in browser environment
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const duration: number = CONFETTI_DURATION;
    const animationEnd: number = Date.now() + duration;
    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      zIndex: 0,
    };

    const randomInRange = (min: number, max: number): number => {
      return Math.random() * (max - min) + min;
    };

    const interval: NodeJS.Timeout = setInterval((): void => {
      const timeLeft: number = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount: number = 50 * (timeLeft / duration);

      confetti(
        Object.assign({}, defaults, {
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        }),
      );
      confetti(
        Object.assign({}, defaults, {
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        }),
      );
    }, 250);
  }
}
