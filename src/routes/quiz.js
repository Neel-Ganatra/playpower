import express from "express";
import {
  createQuiz,
  getQuizHistory,
  submitQuiz,
  retryQuiz,
  getQuestionHint,
  getQuizAnalytics,
  getLeaderboard,
  sendQuizResultsEmail,
  getSubmission,
} from "../controllers/quizController.js";
import {
  validate,
  validateQuery,
  validateParams,
  schemas,
} from "../middleware/validation.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Question:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Unique question identifier
 *         question:
 *           type: string
 *           description: The question text
 *         options:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of answer options
 *         correctAnswer:
 *           type: integer
 *           description: Index of the correct answer (0-based)
 *         difficulty:
 *           type: string
 *           enum: [easy, medium, hard]
 *           description: Question difficulty level
 *         explanation:
 *           type: string
 *           description: Explanation of the correct answer
 *     Quiz:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Unique quiz identifier
 *         grade:
 *           type: string
 *           description: Grade level for the quiz
 *         subject:
 *           type: string
 *           description: Subject of the quiz
 *         questions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Question'
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Quiz creation timestamp
 *     Submission:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Unique submission identifier
 *         userId:
 *           type: integer
 *           description: ID of the user who submitted
 *         quizId:
 *           type: integer
 *           description: ID of the quiz submitted
 *         answers:
 *           type: array
 *           items:
 *             type: integer
 *           description: Array of user's answers
 *         score:
 *           type: number
 *           format: float
 *           description: Score percentage (0-100)
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Submission timestamp
 */

/**
 * @swagger
 * /quiz/create:
 *   post:
 *     summary: 📝 Step 2 - Create AI-generated quiz (Requires Auth)
 *     description: |
 *       **⚠️ Authentication Required!**
 *
 *       If you get "401 Unauthorized" error:
 *       1. **First login** via `/login` endpoint above
 *       2. **Copy the token** from login response
 *       3. **Click 🔒 Authorize** button at top of page
 *       4. **Paste ONLY the token** - do NOT add "Bearer"
 *       5. **Try this endpoint again**
 *     tags: [Quiz Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - grade
 *               - subject
 *             properties:
 *               grade:
 *                 type: string
 *                 description: Grade level for the quiz
 *                 example: "5"
 *               subject:
 *                 type: string
 *                 description: Subject of the quiz
 *                 example: "Mathematics"
 *               questionCount:
 *                 type: integer
 *                 description: Number of questions to generate
 *                 default: 5
 *                 example: 5
 *     responses:
 *       200:
 *         description: Quiz created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Quiz'
 *                 - type: object
 *                   properties:
 *                     difficulty:
 *                       type: string
 *                       description: Adaptive difficulty level
 *                     adaptiveInfo:
 *                       type: object
 *                       properties:
 *                         basedOnSubmissions:
 *                           type: integer
 *                           description: Number of past submissions used for adaptation
 *                         recommendedDifficulty:
 *                           type: string
 *                           description: AI-recommended difficulty level
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Grade and subject are required"
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.post("/create", validate(schemas.createQuiz), asyncHandler(createQuiz));

/**
 * @swagger
 * /quiz/history:
 *   get:
 *     summary: Get quiz history with optional filters
 *     tags: [Quiz Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: grade
 *         schema:
 *           type: string
 *         description: Filter by grade level
 *         example: "5"
 *       - in: query
 *         name: subject
 *         schema:
 *           type: string
 *         description: Filter by subject
 *         example: "Mathematics"
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter from date (YYYY-MM-DD)
 *         example: "2024-01-09"
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter to date (YYYY-MM-DD)
 *         example: "2024-09-09"
 *     responses:
 *       200:
 *         description: Quiz history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 allOf:
 *                   - $ref: '#/components/schemas/Quiz'
 *                   - type: object
 *                     properties:
 *                       submissions:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/Submission'
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.get(
  "/history",
  validateQuery(schemas.quizHistory),
  asyncHandler(getQuizHistory)
);

/**
 * @swagger
 * /quiz/analytics:
 *   get:
 *     summary: Get user's quiz analytics and performance insights
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: subject
 *         schema:
 *           type: string
 *         description: Filter analytics by subject
 *         example: "Mathematics"
 *     responses:
 *       200:
 *         description: Analytics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 analytics:
 *                   type: object
 *                   properties:
 *                     totalQuizzes:
 *                       type: integer
 *                       description: Total number of quizzes taken
 *                     averageScore:
 *                       type: number
 *                       format: float
 *                       description: Average score across all quizzes
 *                     bestScore:
 *                       type: number
 *                       format: float
 *                       description: Best score achieved
 *                     recentTrend:
 *                       type: object
 *                       description: AI analysis of recent performance trend
 *                     subjectPerformance:
 *                       type: object
 *                       description: Performance breakdown by subject
 *                     improvementAreas:
 *                       type: array
 *                       description: Subjects where improvement is needed
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.get(
  "/analytics",
  validateQuery(schemas.analytics),
  asyncHandler(getQuizAnalytics)
);

/**
 * @swagger
 * /quiz/{id}/submit:
 *   post:
 *     summary: Submit quiz answers and get AI evaluation
 *     tags: [Quiz Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Quiz ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - answers
 *             properties:
 *               answers:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array of answer indices (0-based)
 *                 example: [0, 2, 1, 0, 3]
 *     responses:
 *       200:
 *         description: Quiz submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Submission'
 *                 - type: object
 *                   properties:
 *                     scoreAnalysis:
 *                       type: object
 *                       properties:
 *                         score:
 *                           type: number
 *                           format: float
 *                         correct:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         analysis:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               questionId:
 *                                 type: integer
 *                               correct:
 *                                 type: boolean
 *                               userAnswer:
 *                                 type: integer
 *                               correctAnswer:
 *                                 type: integer
 *                               explanation:
 *                                 type: string
 *                     improvementSuggestions:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: AI-generated improvement tips
 *                     learningPattern:
 *                       type: object
 *                       description: AI analysis of learning patterns
 *                     aiInsights:
 *                       type: object
 *                       description: AI-powered insights and recommendations
 *       400:
 *         description: Bad request - invalid answers format
 *       404:
 *         description: Quiz not found
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.post(
  "/:id/submit",
  validate(schemas.submitQuiz),
  asyncHandler(submitQuiz)
);

/**
 * @swagger
 * /quiz/{id}/retry:
 *   post:
 *     summary: Retry a quiz (allows re-taking)
 *     tags: [Quiz Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Quiz ID to retry
 *         example: 1
 *     responses:
 *       200:
 *         description: Quiz retry initiated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Quiz retry initiated"
 *                 submissionId:
 *                   type: integer
 *                   description: New submission ID for tracking
 *                 quiz:
 *                   $ref: '#/components/schemas/Quiz'
 *       404:
 *         description: Quiz not found
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.post("/:id/retry", asyncHandler(retryQuiz));

/**
 * @swagger
 * /quiz/{quizId}/question/{questionId}/hint:
 *   post:
 *     summary: Get AI-generated hint for a specific question
 *     tags: [AI Features]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: quizId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Quiz ID
 *         example: 1
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Question ID within the quiz
 *         example: 1
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userAnswer:
 *                 type: integer
 *                 description: User's current answer attempt (optional)
 *                 example: 2
 *     responses:
 *       200:
 *         description: Hint generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 questionId:
 *                   type: integer
 *                   description: Question ID the hint is for
 *                 hint:
 *                   type: string
 *                   description: AI-generated helpful hint
 *                 confidence:
 *                   type: number
 *                   format: float
 *                   description: AI confidence in the hint (0-1)
 *                 isSpecific:
 *                   type: boolean
 *                   description: Whether hint is specific to user's answer
 *                 remainingHints:
 *                   type: integer
 *                   description: Number of hints remaining
 *       404:
 *         description: Quiz or question not found
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.post(
  "/:quizId/question/:questionId/hint",
  validate(schemas.getHint),
  asyncHandler(getQuestionHint)
);

/**
 * @swagger
 * /quiz/leaderboard:
 *   get:
 *     summary: Get leaderboard for a specific grade and subject
 *     tags: [Leaderboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: grade
 *         required: true
 *         schema:
 *           type: string
 *         description: Grade level for leaderboard
 *         example: "5"
 *       - in: query
 *         name: subject
 *         required: true
 *         schema:
 *           type: string
 *         description: Subject for leaderboard
 *         example: "Mathematics"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Maximum number of entries to return
 *         example: 10
 *     responses:
 *       200:
 *         description: Leaderboard retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 grade:
 *                   type: string
 *                   description: Grade level
 *                 subject:
 *                   type: string
 *                   description: Subject
 *                 leaderboard:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       rank:
 *                         type: integer
 *                         description: Position in leaderboard
 *                       username:
 *                         type: string
 *                         description: Username
 *                       score:
 *                         type: number
 *                         format: float
 *                         description: Score percentage
 *                       grade:
 *                         type: string
 *                         description: Grade level
 *                       subject:
 *                         type: string
 *                         description: Subject
 *                       completedAt:
 *                         type: string
 *                         format: date-time
 *                         description: Completion timestamp
 *                 totalParticipants:
 *                   type: integer
 *                   description: Total number of participants
 *                 lastUpdated:
 *                   type: string
 *                   format: date-time
 *                   description: Last update timestamp
 *       400:
 *         description: Bad request - missing required parameters
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.get(
  "/leaderboard",
  validateQuery(schemas.leaderboard),
  asyncHandler(getLeaderboard)
);

/**
 * @swagger
 * /quiz/send-email:
 *   post:
 *     summary: Send quiz results via email
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - submissionId
 *               - email
 *             properties:
 *               submissionId:
 *                 type: integer
 *                 description: ID of the submission to send results for
 *                 example: 1
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address to send results to
 *                 example: "user@example.com"
 *     responses:
 *       200:
 *         description: Email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Quiz results sent successfully"
 *                 email:
 *                   type: string
 *                   format: email
 *                   description: Email address the results were sent to
 *       400:
 *         description: Bad request - missing required fields
 *       403:
 *         description: Forbidden - user doesn't own the submission
 *       404:
 *         description: Submission not found
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       500:
 *         description: Internal server error - email sending failed
 */
router.post(
  "/send-email",
  validate(schemas.sendEmail),
  asyncHandler(sendQuizResultsEmail)
);

// Get submission data for EmailJS
router.get("/submission/:id", asyncHandler(getSubmission));

export default router;
