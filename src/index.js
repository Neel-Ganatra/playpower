import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import authRoutes from "./routes/auth.js";
import quizRoutes from "./routes/quiz.js";
import { authenticateToken } from "./middleware/authMiddleware.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import redisService from "./services/redisService.js";

dotenv.config();

const app = express();

// Trust proxy (important for Render deployment)
app.set("trust proxy", true);

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// CORS configuration
app.use(
  cors({
    origin: true, // Allow all origins including file://
    credentials: true,
    optionsSuccessStatus: 200, // For legacy browser support
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "AI Quizzer API",
      version: "1.0.0",
      description: `
# AI Quizzer API Documentation

AI-powered quiz application with authentication, adaptive difficulty, and intelligent evaluation.

## 🔐 Authentication Guide

### Step 1: Login
1. Use \`POST /login\` endpoint with any username/password
2. Copy the \`token\` from the response

### Step 2: Authorize Protected Endpoints
1. Click the 🔒 **Authorize** button at the top of this page
2. **Just paste your TOKEN directly** - DO NOT add "Bearer"
3. Swagger automatically adds "Bearer " for you
4. Click **Authorize**

### Example:
- Login response: \`{"token": "eyJhbGciOiJIUzI1..."}\`
- In Authorize field: \`eyJhbGciOiJIUzI1...\` (token only)

**⚠️ Important:** Only paste the token - Swagger adds "Bearer " automatically!

## 🧪 Testing Flow
1. **Login** → Get token
2. **Authorize** → Use token  
3. **Test** → Any protected endpoint
      `,
      contact: {
        name: "AI Quizzer Team",
        email: "hiring.support@playpowerlabs.com",
      },
    },
    servers: [
      {
        url: process.env.API_URL || "http://localhost:4000",
        description: "API Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: `
**How to authenticate:**
1. Login via POST /login to get a token
2. Click 🔒 Authorize button above  
3. **Paste ONLY your token** (do not add "Bearer")
4. Swagger automatically adds "Bearer " prefix

**Example:** 
- Token from login: \`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\`
- Enter in field: \`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\` (token only)
          `,
        },
      },
    },
  },
  apis: ["./src/routes/*.js", "./src/controllers/*.js"],
};

// Dynamic Swagger setup that adapts to current host
app.use("/api-docs", swaggerUi.serve, (req, res, next) => {
  // Determine the correct protocol - force HTTPS for Render deployment
  let protocol = req.protocol;
  const host = req.get("host");

  // Force HTTPS for Render deployment
  if (host && host.includes("render.com")) {
    protocol = "https";
  }

  // Also check for forwarded protocol (common in cloud deployments)
  const forwardedProto = req.get("x-forwarded-proto");
  if (forwardedProto) {
    protocol = forwardedProto;
  }

  const serverUrl = `${protocol}://${host}`;

  console.log(
    `[Swagger] Host: ${host}, Protocol: ${protocol}, Server URL: ${serverUrl}`
  );

  // Update server URL dynamically based on current request
  const dynamicSwaggerOptions = {
    ...swaggerOptions,
    definition: {
      ...swaggerOptions.definition,
      servers: [
        {
          url: serverUrl,
          description: "Current API Server",
        },
      ],
    },
  };

  const swaggerSpec = swaggerJsdoc(dynamicSwaggerOptions);
  swaggerUi.setup(swaggerSpec)(req, res, next);
});

// Root route - redirect directly to Swagger docs
app.get("/", (req, res) => {
  res.redirect("/api-docs");
});

// API information route (for those who want JSON)
app.get("/info", (req, res) => {
  res.json({
    message: "Welcome to AI Quizzer API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    endpoints: {
      health: "/health",
      docs: "/api-docs",
      auth: {
        login: "POST /login",
      },
      quiz: {
        create: "POST /quiz/create (Auth required)",
        history: "GET /quiz/history (Auth required)",
        analytics: "GET /quiz/analytics (Auth required)",
        submit: "POST /quiz/:id/submit (Auth required)",
        retry: "POST /quiz/:id/retry (Auth required)",
        hint: "POST /quiz/:quizId/question/:questionId/hint (Auth required)",
      },
    },
    documentation: `${req.protocol}://${req.get("host")}/api-docs`,
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

app.use("/login", authRoutes);
app.use("/quiz", authenticateToken, quizRoutes);

app.get("/protected", authenticateToken, (req, res) => {
  res.json({ message: `Hello ${req.user.username}` });
});

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

// Initialize services and start server
async function startServer() {
  if (process.env.NODE_ENV !== "test") {
    // Only try to connect to Redis if REDIS_URL is provided
    if (process.env.REDIS_URL) {
      await redisService.connect().catch((err) => {
        console.log("⚠️ Redis connection failed, continuing without cache");
      });
    } else {
      console.log("⚠️ No REDIS_URL provided. Running without Redis caching.");
    }

    app.listen(PORT, () => {
      console.log(`🚀 AI Quizzer API running on port ${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
      console.log(`\n🔧 Database Commands:`);
      console.log(`  npx prisma studio - Open database GUI`);
      console.log(`  mysql -u root -p - Connect to MySQL`);
      console.log(`\n🧪 API Testing:`);
      console.log(`  node test-api.js - Run API tests`);
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      console.log("\n🛑 Shutting down server...");
      if (process.env.REDIS_URL) {
        await redisService.disconnect();
      }
      process.exit(0);
    });
  }
}

// Start the server
if (process.env.NODE_ENV !== "test") {
  startServer();
}

export { app };
