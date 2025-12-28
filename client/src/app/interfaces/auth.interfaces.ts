export interface IUser {
  userId: number;
  name: string;
  email: string;
  gamesPlayed: number;
  wins: number;
  bestWpm: number;
}

export interface IAuthResponse {
  message: string;
  data: {
    user: IUser;
    accessToken: string;
    refreshToken: string;
  };
}
export interface ILoginRequest {
  email: string;
  password: string;
}

export interface IRegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface ILogoutResponse {
  message: string;
}

export interface IUsersListResponse {
  users: IUser[];
  total: number;
}
