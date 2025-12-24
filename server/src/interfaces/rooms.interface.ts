export interface IGetRooms {
  key: string,
  data: {
    roomName: string,
    players: [
      {
        userId: number,
        userName: string,
        isCreated: boolean,
        stats?: {
          wpm?: number,
          accuracy?: number,
          totalMistakes?: number,
          timeTakenSeconds?: number,
          progress?: number,
          finished?: boolean,
        }
      },
    ],
    gameStarted: boolean
  };
}