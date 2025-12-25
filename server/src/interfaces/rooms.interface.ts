export interface IPlayer {
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

export interface IGetRooms {
  key: string;
  data: {
    roomName: string;
    players: IPlayer[];
    gameStarted: boolean;
  };
}

export interface IPlayerStats {
  wpm: number;
  accuracy: number;
  totalMistakes: number;
  timeTakenSeconds: number;
}
