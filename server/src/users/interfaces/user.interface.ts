export interface IUser {
  id: number;
  name: string;
  email: string;
  password: string;
  wins: number;
  gamesPlayed: number;
  bestWpm: number;
  created_at: Date;
  updated_at: Date;
  created_by: number;
  updated_by: number;
}

export interface IUserProfile {
  id: number;
  name: string;
  email: string;
  wins: number;
  gamesPlayed: number;
  bestWpm: number;
  created_at: Date;
  updated_at: Date;
  created_by: number;
  updated_by: number;
}

export interface ICreateUserData {
  name: string;
  email: string;
  password: string;
}
