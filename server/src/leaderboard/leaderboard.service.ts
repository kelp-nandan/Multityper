import { Injectable } from '@nestjs/common';
import { UserRepository } from 'src/database/repositories/user.repository';

@Injectable()
export class LeaderboardService {
   constructor(private userRepository: UserRepository) {}

   async updateStats(userId: number, stats: {
    wins?: number;
    wpm?: number;
   }) {
      try{
        const user = await this.userRepository.fetchUserStats(userId);
        if(!user) {
            throw new Error('User not found');
        }
        const updatedWins = (user.data.wins || 0) + (stats.wins || 0);
        const updatedGamesPlayed = (user.data.gamesPlayed || 0) + 1;
        const updatedBestWpm = stats.wpm && stats.wpm > (user.data.bestWpm || 0) ? stats.wpm : (user.data.bestWpm || 0);

        await this.userRepository.updateUserStats(userId, {
            wins: updatedWins,
            gamesPlayed: updatedGamesPlayed,
            bestWpm: updatedBestWpm,
        });
      } catch(error) {
        console.log(error);
      }
   }

   async fetchStats(userId: number) {
      try {
        return await this.userRepository.fetchUserStats(userId);
      } catch(error) {
        console.log(error);
        throw error;
      }
   }
}
