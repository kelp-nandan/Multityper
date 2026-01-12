import { Injectable, OnModuleDestroy } from "@nestjs/common";
import Redis from "ioredis";
import { REDIS } from "../constants/redis";
import { IRoomData, IUserSession } from "../interfaces/common.interface";

@Injectable()
export class RedisService implements OnModuleDestroy {
  private redisClient: Redis;

  constructor() {
    this.redisClient = new Redis({
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379", 10),
      password: process.env.REDIS_PASSWORD || undefined,
      db: parseInt(process.env.REDIS_DB || "0", 10),
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    this.redisClient.on("error", err => {
      console.error("Redis connection error:", err);
    });
  }

  getClient(): Redis {
    return this.redisClient;
  }

  async get(key: string): Promise<string | null> {
    return await this.redisClient.get(key);
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.redisClient.set(key, value, "EX", ttl);
    } else {
      await this.redisClient.set(key, value);
    }
  }

  async delete(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  async blacklistToken(
    token: string,
    tokenType: "access" | "refresh" | "uti",
    ttl: number = REDIS.TOKEN_BLACKLIST_TTL,
  ): Promise<void> {
    const key = this.getBlacklistKey(token, tokenType);
    await this.set(key, "blacklisted", ttl);
  }

  async isTokenBlacklisted(
    token: string,
    tokenType: "access" | "refresh" | "uti",
  ): Promise<boolean> {
    const key = this.getBlacklistKey(token, tokenType);
    const result = await this.get(key);
    return result !== null;
  }

  async removeFromBlacklist(token: string, tokenType: "access" | "refresh" | "uti"): Promise<void> {
    const key = this.getBlacklistKey(token, tokenType);
    await this.delete(key);
  }

  private getBlacklistKey(token: string, tokenType: "access" | "refresh" | "uti"): string {
    return `${REDIS.BLACKLIST_PREFIX}:${tokenType}:${token}`;
  }

  async storeUserSession(userId: number, sessionData: IUserSession, ttl?: number): Promise<void> {
    const key = `${REDIS.USER_SESSION_PREFIX}:${userId}`;
    await this.set(key, JSON.stringify(sessionData), ttl);
  }

  async getUserSession(userId: number): Promise<IUserSession | null> {
    const key = `${REDIS.USER_SESSION_PREFIX}:${userId}`;
    const data = await this.get(key);
    return data ? JSON.parse(data) : null;
  }

  async deleteUserSession(userId: number): Promise<void> {
    const key = `${REDIS.USER_SESSION_PREFIX}:${userId}`;
    await this.delete(key);
  }

  async setRoom({ key, data }: { key: string; data: IRoomData }): Promise<void> {
    await this.set(key, JSON.stringify(data));
  }

  async getRoom(roomId: string): Promise<IRoomData | null> {
    const data = await this.get(roomId);
    return data ? JSON.parse(data) : null;
  }

  async deleteRoom(roomId: string): Promise<void> {
    await this.delete(roomId);
  }

  async getAllRooms(): Promise<IRoomData[]> {
    const keys = await this.redisClient.keys("*");
    const rooms: IRoomData[] = [];

    for (const key of keys) {
      const data = await this.get(key);
      if (data) {
        try {
          const parsed = JSON.parse(data);
          if (parsed.roomId) {
            rooms.push(parsed);
          }
        } catch (e) {
          // Skip non-room keys
        }
      }
    }

    return rooms;
  }

  onModuleDestroy(): void {
    this.redisClient.disconnect();
  }
}
