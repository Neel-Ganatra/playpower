import prisma from "../services/db.js";
import aiService from "../services/aiService.js";
import emailService from "../services/emailService.js";
import cacheService from "../services/cacheService.js";

export const createQuiz = async (req, res) => {
  const { grade, subject, questionCount = 5 } = req.body;

  // Ensure user exists in database
  let user = await prisma.user.findUnique({
    where: { username: req.user.username },
  });

  if (!user) {
    user = await prisma.user.create({
      data: { username: req.user.username },
    });
  }

  // Get user's past submissions for adaptive difficulty
  const pastSubmissions = await prisma.submission.findMany({
    where: { userId: user.id },
    include: { quiz: true },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  // Calculate adaptive difficulty based on past performance
  const difficulty = await aiService.calculateAdaptiveDifficulty(
    user.id,
    subject,
    pastSubmissions
  );

  // Generate AI-powered questions with adaptive difficulty
  const aiQuestions = await aiService.generateQuestions(
    grade,
    subject,
    difficulty,
    questionCount
  );

  const quiz = await prisma.quiz.create({
    data: {
      grade,
      subject,
      questions: aiQuestions,
    },
  });

  res.json({
    ...quiz,
    difficulty,
    adaptiveInfo: {
      basedOnSubmissions: pastSubmissions.length,
      recommendedDifficulty: difficulty,
    },
  });
};

export const getQuizHistory = async (req, res) => {
  const { grade, subject, fromDate, toDate } = req.query;

  // Ensure user exists in database
  let user = await prisma.user.findUnique({
    where: { username: req.user.username },
  });

  if (!user) {
    user = await prisma.user.create({
      data: { username: req.user.username },
    });
  }

  const whereConditions = {};

  if (grade) whereConditions.grade = grade;
  if (subject) whereConditions.subject = subject;
  if (fromDate || toDate) {
    whereConditions.createdAt = {};
    if (fromDate) whereConditions.createdAt.gte = new Date(fromDate);
    if (toDate) whereConditions.createdAt.lte = new Date(toDate);
  }

  const quizzes = await prisma.quiz.findMany({
    where: whereConditions,
    include: {
      submissions: {
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json(quizzes);
};

export const submitQuiz = async (req, res) => {
  const { id } = req.params;
  const { answers } = req.body;

  // Ensure user exists in database
  let user = await prisma.user.findUnique({
    where: { username: req.user.username },
  });

  if (!user) {
    user = await prisma.user.create({
      data: { username: req.user.username },
    });
  }

  // Check if quiz exists
  const quiz = await prisma.quiz.findUnique({
    where: { id: parseInt(id) },
  });

  if (!quiz) {
    const error = new Error("Quiz not found");
    error.name = "NotFoundError";
    throw error;
  }

  // Use AI service to calculate accurate score and analysis
  const scoreResult = await aiService.calculateScore(quiz.questions, answers);

  // Get user's past submissions for improvement suggestions
  const pastSubmissions = await prisma.submission.findMany({
    where: { userId: user.id },
    include: { quiz: true },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  // Generate AI-powered improvement suggestions
  const improvementSuggestions = await aiService.generateImprovementSuggestions(
    scoreResult.score,
    quiz.subject,
    scoreResult.analysis.filter((a) => !a.correct).map((a) => a.questionId)
  );

  // Analyze learning pattern
  const learningPattern = await aiService.analyzeLearningPattern(
    pastSubmissions,
    quiz.subject
  );

  const submission = await prisma.submission.create({
    data: {
      userId: user.id,
      quizId: parseInt(id),
      answers,
      score: scoreResult.score,
    },
  });

  res.json({
    ...submission,
    scoreAnalysis: scoreResult,
    improvementSuggestions,
    learningPattern,
    aiInsights: {
      strengths:
        scoreResult.analysis.filter((a) => a.correct).length >
        scoreResult.analysis.length / 2
          ? `Strong performance in ${quiz.subject}`
          : `Room for improvement in ${quiz.subject}`,
      nextSteps: improvementSuggestions,
    },
  });
};

export const retryQuiz = async (req, res) => {
  const { id } = req.params;

  // Ensure user exists in database
  let user = await prisma.user.findUnique({
    where: { username: req.user.username },
  });

  if (!user) {
    user = await prisma.user.create({
      data: { username: req.user.username },
    });
  }

  // Check if quiz exists
  const quiz = await prisma.quiz.findUnique({
    where: { id: parseInt(id) },
  });

  if (!quiz) {
    const error = new Error("Quiz not found");
    error.name = "NotFoundError";
    throw error;
  }

  // Create a new submission with empty answers and 0 score (to be filled when user submits)
  const submission = await prisma.submission.create({
    data: {
      userId: user.id,
      quizId: parseInt(id),
      answers: [],
      score: 0,
    },
  });

  res.json({
    message: "Quiz retry initiated",
    submissionId: submission.id,
    quiz: {
      id: quiz.id,
      grade: quiz.grade,
      subject: quiz.subject,
      questions: quiz.questions,
    },
  });
};

// New AI-powered hint generation endpoint
export const getQuestionHint = async (req, res) => {
  const { quizId, questionId } = req.params;
  const { userAnswer } = req.body; // Optional: user's current answer attempt

  // Check if quiz exists
  const quiz = await prisma.quiz.findUnique({
    where: { id: parseInt(quizId) },
  });

  if (!quiz) {
    const error = new Error("Quiz not found");
    error.name = "NotFoundError";
    throw error;
  }

  // Find the specific question
  const question = quiz.questions.find((q) => q.id === parseInt(questionId));

  if (!question) {
    const error = new Error("Question not found");
    error.name = "NotFoundError";
    throw error;
  }

  // Generate AI-powered hint
  const hintResult = await aiService.generateHint(
    question.question,
    userAnswer
  );

  res.json({
    questionId: parseInt(questionId),
    hint: hintResult.hint,
    confidence: hintResult.confidence,
    isSpecific: hintResult.isSpecific,
    remainingHints: 2, // Mock remaining hints (implement hint limits later)
  });
};

// Get quiz analytics and AI insights for a user
export const getQuizAnalytics = async (req, res) => {
  const { subject } = req.query;

  // Ensure user exists in database
  let user = await prisma.user.findUnique({
    where: { username: req.user.username },
  });

  if (!user) {
    const error = new Error("User not found");
    error.name = "NotFoundError";
    throw error;
  }

  // Get user's submissions with quiz details
  const whereCondition = subject
    ? { userId: user.id, quiz: { subject } }
    : { userId: user.id };

  const submissions = await prisma.submission.findMany({
    where: whereCondition,
    include: { quiz: true },
    orderBy: { createdAt: "desc" },
  });

  if (submissions.length === 0) {
    return res.json({
      message: "No quiz data available",
      analytics: null,
    });
  }

  // Calculate analytics
  const totalQuizzes = submissions.length;
  const averageScore =
    submissions.reduce((sum, sub) => sum + sub.score, 0) / totalQuizzes;
  const bestScore = Math.max(...submissions.map((s) => s.score));
  const recentTrend = await aiService.analyzeLearningPattern(
    submissions,
    subject || "all subjects"
  );

  // Subject-wise performance
  const subjectPerformance = {};
  submissions.forEach((sub) => {
    const subj = sub.quiz.subject;
    if (!subjectPerformance[subj]) {
      subjectPerformance[subj] = { scores: [], count: 0 };
    }
    subjectPerformance[subj].scores.push(sub.score);
    subjectPerformance[subj].count++;
  });

  // Calculate averages for each subject
  Object.keys(subjectPerformance).forEach((subj) => {
    const scores = subjectPerformance[subj].scores;
    subjectPerformance[subj].average =
      scores.reduce((a, b) => a + b, 0) / scores.length;
  });

  res.json({
    analytics: {
      totalQuizzes,
      averageScore: Math.round(averageScore * 100) / 100,
      bestScore,
      recentTrend,
      subjectPerformance,
      improvementAreas: Object.keys(subjectPerformance)
        .filter((subj) => subjectPerformance[subj].average < 70)
        .map((subj) => ({
          subject: subj,
          averageScore: subjectPerformance[subj].average,
          quizzesTaken: subjectPerformance[subj].count,
        })),
    },
  });
};

// Get leaderboard for a specific grade and subject
export const getLeaderboard = async (req, res) => {
  const { grade, subject, limit = 10 } = req.query;

  const cacheKey = `leaderboard:${grade}:${subject}`;

  // Try to get from cache first
  const cachedLeaderboard = await cacheService.get(cacheKey);
  if (cachedLeaderboard) {
    return res.json(cachedLeaderboard);
  }

  // Get top scores for the specified grade and subject
  const leaderboard = await prisma.submission.findMany({
    where: {
      quiz: {
        grade: grade,
        subject: subject,
      },
    },
    include: {
      user: {
        select: {
          username: true,
        },
      },
      quiz: {
        select: {
          grade: true,
          subject: true,
        },
      },
    },
    orderBy: {
      score: "desc",
    },
    take: parseInt(limit),
  });

  // Format leaderboard data
  const formattedLeaderboard = leaderboard.map((submission, index) => ({
    rank: index + 1,
    username: submission.user.username,
    score: submission.score,
    grade: submission.quiz.grade,
    subject: submission.quiz.subject,
    completedAt: submission.createdAt,
  }));

  const result = {
    grade,
    subject,
    leaderboard: formattedLeaderboard,
    totalParticipants: leaderboard.length,
    lastUpdated: new Date(),
  };

  // Cache the result for 5 minutes
  await cacheService.set(cacheKey, result, 300);

  res.json(result);
};

// Send quiz results via email
export const sendQuizResultsEmail = async (req, res) => {
  const { submissionId, email } = req.body;

  // Get submission details
  const submission = await prisma.submission.findUnique({
    where: { id: parseInt(submissionId) },
    include: {
      user: true,
      quiz: true,
    },
  });

  if (!submission) {
    const error = new Error("Submission not found");
    error.name = "NotFoundError";
    throw error;
  }

  // Verify user owns this submission
  if (submission.user.username !== req.user.username) {
    const error = new Error("Access denied");
    error.name = "ForbiddenError";
    throw error;
  }

  // Get score analysis
  const scoreResult = await aiService.calculateScore(
    submission.quiz.questions,
    submission.answers
  );

  // Get improvement suggestions
  const improvementSuggestions = await aiService.generateImprovementSuggestions(
    submission.score,
    submission.quiz.subject,
    scoreResult.analysis.filter((a) => !a.correct).map((a) => a.questionId)
  );

  const quizData = {
    username: submission.user.username,
    quiz: submission.quiz,
    score: submission.score,
    improvementSuggestions,
  };

  const emailSent = await emailService.sendQuizResults(
    email,
    quizData,
    scoreResult
  );

  if (!emailSent) {
    // Don't throw error - just return a warning message for testing
    return res.status(200).json({
      message: "Quiz results processed, but email sending is not configured",
      warning:
        "Email credentials not set up. Check EMAIL_USER and EMAIL_PASS in .env file",
      submissionId: submissionId,
      score: submission.score,
      email: email,
    });
  }

  res.json({
    message: "Quiz results sent successfully",
    email: email,
  });
};

// Get submission data for EmailJS (frontend email sending)
export const getSubmission = async (req, res) => {
  const submissionId = parseInt(req.params.id);

  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: {
      user: true,
      quiz: true,
    },
  });

  if (!submission) {
    const error = new Error("Submission not found");
    error.name = "NotFoundError";
    throw error;
  }

  // Verify user owns this submission
  if (submission.user.username !== req.user.username) {
    const error = new Error("Access denied");
    error.name = "ForbiddenError";
    throw error;
  }

  res.json({
    success: true,
    data: submission,
  });
};
