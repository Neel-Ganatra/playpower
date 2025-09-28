import Redis from "redis";

class RedisService {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      this.client = Redis.createClient({
        url: process.env.REDIS_URL || "redis://localhost:6379",
        retry_strategy: (options) => {
          if (options.error && options.error.code === "ECONNREFUSED") {
            console.log(
              "Redis connection refused. Make sure Redis server is running."
            );
            return new Error("Redis server connection refused");
          }
          if (options.total_retry_time > 1000 * 60 * 60) {
            console.log("Redis retry time exhausted");
            return new Error("Retry time exhausted");
          }
          if (options.attempt > 10) {
            console.log("Redis max connection attempts reached");
            return undefined;
          }
          // Reconnect after
          return Math.min(options.attempt * 100, 3000);
        },
      });

      this.client.on("error", (err) => {
        console.error("Redis Client Error:", err);
        this.isConnected = false;
      });

      this.client.on("connect", () => {
        console.log("✅ Connected to Redis");
        this.isConnected = true;
      });

      this.client.on("ready", () => {
        console.log("✅ Redis client ready");
        this.isConnected = true;
      });

      this.client.on("end", () => {
        console.log("❌ Redis connection ended");
        this.isConnected = false;
      });

      await this.client.connect();
      return this.client;
    } catch (error) {
      console.error("Failed to connect to Redis:", error.message);
      this.isConnected = false;
      // Don't throw error - allow app to run without Redis
      return null;
    }
  }

  async disconnect() {
    if (this.client && this.isConnected) {
      await this.client.quit();
      this.isConnected = false;
      console.log("✅ Disconnected from Redis");
    }
  }

  // Cache quiz data
  async cacheQuiz(quizId, quizData, expireInSeconds = 3600) {
    if (!this.isConnected) return false;

    try {
      const key = `quiz:${quizId}`;
      await this.client.setEx(key, expireInSeconds, JSON.stringify(quizData));
      console.log(`✅ Cached quiz ${quizId}`);
      return true;
    } catch (error) {
      console.error("Error caching quiz:", error);
      return false;
    }
  }

  // Get cached quiz
  async getCachedQuiz(quizId) {
    if (!this.isConnected) return null;

    try {
      const key = `quiz:${quizId}`;
      const cached = await this.client.get(key);
      if (cached) {
        console.log(`✅ Retrieved cached quiz ${quizId}`);
        return JSON.parse(cached);
      }
      return null;
    } catch (error) {
      console.error("Error getting cached quiz:", error);
      return null;
    }
  }

  // Cache user session data
  async cacheUserSession(userId, sessionData, expireInSeconds = 86400) {
    // 24 hours
    if (!this.isConnected) return false;

    try {
      const key = `user:session:${userId}`;
      await this.client.setEx(
        key,
        expireInSeconds,
        JSON.stringify(sessionData)
      );
      return true;
    } catch (error) {
      console.error("Error caching user session:", error);
      return false;
    }
  }

  // Get cached user session
  async getCachedUserSession(userId) {
    if (!this.isConnected) return null;

    try {
      const key = `user:session:${userId}`;
      const cached = await this.client.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error("Error getting cached user session:", error);
      return null;
    }
  }

  // Cache AI-generated hints to avoid regenerating same hints
  async cacheHint(quizId, questionId, hint, expireInSeconds = 7200) {
    // 2 hours
    if (!this.isConnected) return false;

    try {
      const key = `hint:${quizId}:${questionId}`;
      await this.client.setEx(key, expireInSeconds, JSON.stringify(hint));
      return true;
    } catch (error) {
      console.error("Error caching hint:", error);
      return false;
    }
  }

  // Get cached hint
  async getCachedHint(quizId, questionId) {
    if (!this.isConnected) return null;

    try {
      const key = `hint:${quizId}:${questionId}`;
      const cached = await this.client.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error("Error getting cached hint:", error);
      return null;
    }
  }

  // Rate limiting for API calls
  async checkRateLimit(identifier, maxRequests = 100, windowInSeconds = 3600) {
    if (!this.isConnected) return { allowed: true, remaining: maxRequests };

    try {
      const key = `ratelimit:${identifier}`;
      const current = await this.client.get(key);

      if (!current) {
        // First request in window
        await this.client.setEx(key, windowInSeconds, "1");
        return { allowed: true, remaining: maxRequests - 1 };
      }

      const count = parseInt(current);
      if (count >= maxRequests) {
        return { allowed: false, remaining: 0 };
      }

      // Increment counter
      await this.client.incr(key);
      return { allowed: true, remaining: maxRequests - count - 1 };
    } catch (error) {
      console.error("Error checking rate limit:", error);
      return { allowed: true, remaining: maxRequests };
    }
  }

  // Generic cache methods
  async set(key, value, expireInSeconds = 3600) {
    if (!this.isConnected) return false;

    try {
      await this.client.setEx(key, expireInSeconds, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error("Error setting cache:", error);
      return false;
    }
  }

  async get(key) {
    if (!this.isConnected) return null;

    try {
      const cached = await this.client.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error("Error getting cache:", error);
      return null;
    }
  }

  async delete(key) {
    if (!this.isConnected) return false;

    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error("Error deleting cache:", error);
      return false;
    }
  }

  // Clear all cache (useful for testing)
  async flushAll() {
    if (!this.isConnected) return false;

    try {
      await this.client.flushAll();
      console.log("✅ Cleared all Redis cache");
      return true;
    } catch (error) {
      console.error("Error clearing cache:", error);
      return false;
    }
  }

  // Get Redis info
  async getInfo() {
    if (!this.isConnected) return null;

    try {
      const info = await this.client.info();
      return info;
    } catch (error) {
      console.error("Error getting Redis info:", error);
      return null;
    }
  }
}

export default new RedisService();
