import express from "express";
import jwt from "jsonwebtoken";
import { validate, schemas } from "../middleware/validation.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = express.Router();

/**
 * @swagger
 * /login:
 *   post:
 *     summary: 🔐 Step 1 - Login to get JWT token
 *     description: |
 *       **Authentication Process:**
 *       1. **Login here** with any username/password to get a JWT token
 *       2. **Copy the token** from the response
 *       3. **Click 🔒 Authorize** button at the top of this page
 *       4. **Paste ONLY the token** - do NOT add "Bearer"
 *       5. **Click Authorize** - now you can test all protected endpoints!
 *
 *       **⚠️ Important:** Swagger automatically adds "Bearer " - just paste your token!
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: Username for authentication
 *                 example: "john_doe"
 *               password:
 *                 type: string
 *                 description: Password for authentication
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token for authenticated requests
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Bad request - missing credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Username and password required"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "JWT secret not set"
 */
router.post(
  "/",
  validate(schemas.login),
  asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    // Accept any username/password for mock authentication
    const payload = { username };
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      const error = new Error("JWT secret not configured");
      error.name = "ConfigurationError";
      throw error;
    }

    const token = jwt.sign(payload, secret, { expiresIn: "1d" });

    res.json({
      token,
      message: "Authentication successful",
      expiresIn: "1d",
    });
  })
);

export default router;
