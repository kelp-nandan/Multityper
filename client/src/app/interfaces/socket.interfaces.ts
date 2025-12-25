export interface IParagraphReady {
  roomId: string;
  paragraph: string;
  paragraphId: number;
}

export interface ICharacterState {
  char: string;
  state: CharState;
}

export interface IWordState {
  word: string;
  chars: ICharacterState[];
  state: WordState;
}

export type WordState = 'pending' | 'active' | 'completed';
export type CharState = 'pending' | 'correct' | 'incorrect';

export interface IAllPlayersFinished {
  message: string;
  roomId: string;
  players: IPlayerData[];
}

export interface IRedirectToLeaderboard {
  roomId: string;
  finalResults: IPlayerData[];
}

export interface IPlayerFinished {
  completedUserId: number;
  waitingCount: number;
}

export interface IPlayerData {
  userId: number;
  userName: string;
  isCreated: boolean;
  stats?: {
    wpm?: number;
    accuracy?: number;
    totalMistakes?: number;
    timeTakenSeconds?: number;
    progress?: number;
    finished?: boolean;
  };
}

export interface ILeaderboardPlayer {
  userId: number;
  userName: string;
  wpm: number;
  accuracy: number;
  totalMistakes: number;
  timeTakenSeconds: number;
  rank: number;
}

export interface ISequelizeUser {
  dataValues?: {
    id: number;
    name: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
  };
  id?: number;
  name?: string;
  email?: string;
}

export interface ILeaderboardDisplay {
  username: string;
  wmp: number;
  accuracy: number;
  time: number;
  Total_Wrong: number;
}
