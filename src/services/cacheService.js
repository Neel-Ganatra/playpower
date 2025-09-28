import { createClient } from "redis";

class CacheService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.init();
  }

  async init() {
    try {
      this.client = createClient({
        url: process.env.REDIS_URL || "redis://localhost:6379",
      });

      this.client.on("error", (err) => {
        console.error("Redis Client Error:", err);
        this.isConnected = false;
      });

      this.client.on("connect", () => {
        console.log("Connected to Redis");
        this.isConnected = true;
      });

      await this.client.connect();
    } catch (error) {
      console.error("Failed to connect to Redis:", error);
      this.isConnected = false;
    }
  }

  async get(key) {
    if (!this.isConnected || !this.client) {
      return null;
    }

    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error("Error getting from cache:", error);
      return null;
    }
  }

  async set(key, value, ttlSeconds = 3600) {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      await this.client.setEx(key, ttlSeconds, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error("Error setting cache:", error);
      return false;
    }
  }

  async del(key) {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error("Error deleting from cache:", error);
      return false;
    }
  }

  async getOrSet(key, fetchFunction, ttlSeconds = 3600) {
    // Try to get from cache first
    let value = await this.get(key);
    
    if (value !== null) {
      return value;
    }

    // If not in cache, fetch the data
    try {
      value = await fetchFunction();
      await this.set(key, value, ttlSeconds);
      return value;
    } catch (error) {
      console.error("Error in getOrSet:", error);
      throw error;
    }
  }

  // Cache keys for different data types
  static getQuizKey(grade, subject, difficulty) {
    return `quiz:${grade}:${subject}:${difficulty}`;
  }

  static getUserHistoryKey(username) {
    return `user_history:${username}`;
  }

  static getLeaderboardKey(grade, subject) {
    return `leaderboard:${grade}:${subject}`;
  }

  static getAnalyticsKey(username, subject) {
    return `analytics:${username}:${subject || 'all'}`;
  }

  async clearUserCache(username) {
    const patterns = [
      `user_history:${username}`,
      `analytics:${username}:*`,
    ];

    for (const pattern of patterns) {
      try {
        const keys = await this.client.keys(pattern);
        if (keys.length > 0) {
          await this.client.del(keys);
        }
      } catch (error) {
        console.error(`Error clearing cache for pattern ${pattern}:`, error);
      }
    }
  }

  async clearQuizCache(grade, subject) {
    const patterns = [
      `quiz:${grade}:${subject}:*`,
      `leaderboard:${grade}:${subject}`,
    ];

    for (const pattern of patterns) {
      try {
        const keys = await this.client.keys(pattern);
        if (keys.length > 0) {
          await this.client.del(keys);
        }
      } catch (error) {
        console.error(`Error clearing quiz cache for pattern ${pattern}:`, error);
      }
    }
  }
}

export default new CacheService();
