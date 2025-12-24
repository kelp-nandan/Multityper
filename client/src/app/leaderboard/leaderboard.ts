import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-leaderboard',
  imports: [CommonModule],
  templateUrl: './leaderboard.html',
  styleUrl: './leaderboard.scss',
})
export class Leaderboard {
  players = [
    { userName: 'Nandan', wpm: 25,  accuracy: 75, ranking: 1, timetaken: 60},
    { userName: 'Aryan', wpm: 28,  accuracy: 80, ranking: 2, timetaken: 50},
    { userName: 'Sahil', wpm: 30,  accuracy: 77, ranking: 3, timetaken: 61},
    { userName: 'Mohit', wpm: 27,  accuracy: 81, ranking: 4, timetaken: 63},
  ]

  trackById(index: number) {
    return index
  }
}
