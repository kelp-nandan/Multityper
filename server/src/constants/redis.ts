export const REDIS_SCAN_COUNT = 100;
export const REDIS = {
  BLACKLIST_PREFIX: "token:blacklist",
  TOKEN_BLACKLIST_TTL: 5400, //90 min

  USER_SESSION_PREFIX: "user:session",
  SESSION_TTL: 86400, //24 hr

  LEADERBOARD_PREFIX: "leaderboard",
  LEADERBOARD_TTL: 3600, //1 hr
};
