import { FRONTEND_URL } from "src/constants";

export const wsConfig = {
  cors:{
    origin: FRONTEND_URL,
    credentials: true,
  }
}