import { IUserProfile } from "../users/interfaces";

export interface IAuthSuccessResponse {
  message: string;
  data: {
    user: IUserProfile;
  };
}

export interface IUserRequest {
  user: IUserProfile;
}

export interface IUsersListResponse {
  message: string;
  data: IUserProfile[];
}

export interface IUserProfileResponse {
  message: string;
  data: {
    user: IUserProfile;
  };
}
