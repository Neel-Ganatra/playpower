import Groq from "groq-sdk";

// AI Service with Groq API integration
class AIService {
  constructor() {
    // Only initialize Groq if valid API key is available
    const apiKey = process.env.GROQ_API_KEY;
    if (apiKey && apiKey !== "your-groq-api-key-here" && apiKey.length > 20) {
      this.groq = new Groq({
        apiKey: apiKey,
      });
      this.hasValidApiKey = true;
      console.log("✅ Groq AI service initialized");
    } else {
      this.groq = null;
      this.hasValidApiKey = false;
      console.log("⚠️ Groq API key not configured - using mock AI responses");
    }
  }
  // Generate questions based on grade, subject, and difficulty
  async generateQuestions(grade, subject, difficulty = "medium", count = 5) {
    // Define difficulty levels outside try block so it's accessible in catch
    const difficultyLevels = {
      easy: "basic",
      medium: "intermediate",
      hard: "advanced",
    };

    // If no valid API key, return mock questions directly
    if (!this.hasValidApiKey) {
      console.log("🔄 Using mock AI responses for questions");
      const questions = [];
      for (let i = 1; i <= count; i++) {
        questions.push({
          id: i,
          question: `${difficultyLevels[difficulty]} ${subject} question ${i} for grade ${grade}`,
          options: [
            `Correct answer for ${subject}`,
            `Incorrect option A`,
            `Incorrect option B`,
            `Incorrect option C`,
          ],
          correctAnswer: 0,
          difficulty: difficulty,
          explanation: `This question tests ${difficultyLevels[difficulty]} understanding of ${subject} concepts for grade ${grade}.`,
        });
      }
      return questions;
    }

    try {
      const prompt = `Generate ${count} ${difficultyLevels[difficulty]} level ${subject} questions for grade ${grade} students. Each question should have:
1. A clear, age-appropriate question
2. 4 multiple choice options (A, B, C, D)
3. The correct answer (0-3 index)
4. A brief explanation
5. Appropriate difficulty level

Format as JSON array with this structure:
[
  {
    "id": 1,
    "question": "Question text here",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "difficulty": "${difficulty}",
    "explanation": "Explanation of the correct answer"
  }
]`;

      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              "You are an expert educational content creator specializing in creating age-appropriate quiz questions. Always respond with valid JSON only, no additional text.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        model: "llama3-8b-8192",
        temperature: 0.7,
        max_tokens: 2000,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error("No response from AI service");
      }

      const questions = JSON.parse(response);

      // Validate and ensure proper structure
      return questions.map((q, index) => ({
        id: index + 1,
        question: q.question || `Question ${index + 1}`,
        options: q.options || ["Option A", "Option B", "Option C", "Option D"],
        correctAnswer: q.correctAnswer || 0,
        difficulty: q.difficulty || difficulty,
        explanation: q.explanation || "No explanation provided",
      }));
    } catch (error) {
      console.error("Error generating questions with Groq:", error);

      // Fallback to mock questions if AI service fails
      const questions = [];
      for (let i = 1; i <= count; i++) {
        questions.push({
          id: i,
          question: `${difficultyLevels[difficulty]} ${subject} question ${i} for grade ${grade}`,
          options: [
            `Correct answer for ${subject}`,
            `Incorrect option A`,
            `Incorrect option B`,
            `Incorrect option C`,
          ],
          correctAnswer: 0,
          difficulty: difficulty,
          explanation: `This question tests ${difficultyLevels[difficulty]} understanding of ${subject} concepts for grade ${grade}.`,
        });
      }
      return questions;
    }
  }

  // Generate hint for a specific question
  async generateHint(question, userAnswer = null) {
    // If no valid API key, return mock hint directly
    if (!this.hasValidApiKey) {
      console.log("🔄 Using mock AI responses for hints");
      const hints = [
        `Think about the key concepts in ${question.slice(0, 20)}...`,
        `Consider reviewing the fundamental principles related to this topic.`,
        `Look for keywords in the question that might guide you to the answer.`,
        `Break down the question into smaller parts and analyze each component.`,
      ];

      const randomHint = hints[Math.floor(Math.random() * hints.length)];

      return {
        hint: randomHint,
        confidence: Math.random() * 0.3 + 0.7,
        isSpecific: userAnswer ? true : false,
      };
    }

    try {
      const prompt = `Provide a helpful hint for this quiz question: "${question}"
      
      ${userAnswer ? `The student's current answer is: "${userAnswer}"` : ""}
      
      Generate a hint that:
      1. Guides the student toward the correct answer without giving it away
      2. Is educational and helps them learn
      3. Is appropriate for the question difficulty
      4. Is encouraging and supportive
      
      Respond with a JSON object:
      {
        "hint": "Your helpful hint here",
        "confidence": 0.85,
        "isSpecific": true
      }`;

      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              "You are an expert tutor providing helpful hints for quiz questions. Always respond with valid JSON only, no additional text.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        model: "llama3-8b-8192",
        temperature: 0.6,
        max_tokens: 300,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error("No response from AI service");
      }

      const result = JSON.parse(response);
      return {
        hint:
          result.hint ||
          "Think carefully about the key concepts in this question.",
        confidence: result.confidence || 0.8,
        isSpecific: result.isSpecific || false,
      };
    } catch (error) {
      console.error("Error generating hint with Groq:", error);

      // Fallback to mock hints
      const hints = [
        `Think about the key concepts in ${question.slice(0, 20)}...`,
        `Consider reviewing the fundamental principles related to this topic.`,
        `Look for keywords in the question that might guide you to the answer.`,
        `Break down the question into smaller parts and analyze each component.`,
      ];

      const randomHint = hints[Math.floor(Math.random() * hints.length)];

      return {
        hint: randomHint,
        confidence: Math.random() * 0.3 + 0.7,
        isSpecific: userAnswer ? true : false,
      };
    }
  }

  // Calculate quiz score and provide detailed analysis
  async calculateScore(questions, answers) {
    let correct = 0;
    const analysis = [];

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const userAnswer = answers[i];
      const isCorrect = userAnswer === question.correctAnswer;

      if (isCorrect) correct++;

      analysis.push({
        questionId: question.id,
        correct: isCorrect,
        userAnswer,
        correctAnswer: question.correctAnswer,
        explanation:
          question.explanation ||
          `The correct answer is option ${question.correctAnswer + 1}.`,
      });
    }

    const score = Math.round((correct / questions.length) * 100);

    return {
      score,
      correct,
      total: questions.length,
      analysis,
    };
  }

  // Generate improvement suggestions based on quiz performance
  async generateImprovementSuggestions(score, subject, incorrectTopics = []) {
    // If no valid API key, return mock suggestions directly
    if (!this.hasValidApiKey) {
      console.log("🔄 Using mock AI responses for improvement suggestions");
      const suggestions = [];

      if (score < 60) {
        suggestions.push(
          `Focus on fundamental ${subject} concepts. Consider reviewing basic materials and practice more frequently.`,
          `Break down complex topics into smaller, manageable parts. Use active recall techniques while studying.`
        );
      } else if (score < 80) {
        suggestions.push(
          `Good progress! Work on understanding the nuances of ${subject}. Practice with more challenging problems.`,
          `Review the questions you got wrong and understand the reasoning behind correct answers.`
        );
      } else {
        suggestions.push(
          `Excellent work! To maintain this level, try teaching ${subject} concepts to others or tackle advanced topics.`,
          `Consider exploring real-world applications of ${subject} to deepen your understanding further.`
        );
      }

      return suggestions.slice(0, 2);
    }

    try {
      const prompt = `A student scored ${score}% on a ${subject} quiz. 
      
      ${
        incorrectTopics.length > 0
          ? `They struggled with these question topics: ${incorrectTopics.join(
              ", "
            )}`
          : ""
      }
      
      Provide exactly 2 specific, actionable improvement suggestions that are:
      1. Personalized based on their score and performance
      2. Educational and constructive
      3. Specific to ${subject} learning
      4. Encouraging and motivating
      
      Format as JSON array:
      ["Suggestion 1", "Suggestion 2"]`;

      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              "You are an expert educational coach providing personalized learning recommendations. Always respond with valid JSON array only, no additional text.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        model: "llama3-8b-8192",
        temperature: 0.7,
        max_tokens: 400,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error("No response from AI service");
      }

      const suggestions = JSON.parse(response);
      return Array.isArray(suggestions) ? suggestions.slice(0, 2) : suggestions;
    } catch (error) {
      console.error(
        "Error generating improvement suggestions with Groq:",
        error
      );

      // Fallback to mock suggestions
      const suggestions = [];

      if (score < 60) {
        suggestions.push(
          `Focus on fundamental ${subject} concepts. Consider reviewing basic materials and practice more frequently.`,
          `Break down complex topics into smaller, manageable parts. Use active recall techniques while studying.`
        );
      } else if (score < 80) {
        suggestions.push(
          `Good progress! Work on understanding the nuances of ${subject}. Practice with more challenging problems.`,
          `Review the questions you got wrong and understand the reasoning behind correct answers.`
        );
      } else {
        suggestions.push(
          `Excellent work! To maintain this level, try teaching ${subject} concepts to others or tackle advanced topics.`,
          `Consider exploring real-world applications of ${subject} to deepen your understanding further.`
        );
      }

      return suggestions.slice(0, 2);
    }
  }

  // Determine adaptive difficulty based on user's past performance
  async calculateAdaptiveDifficulty(userId, subject, pastSubmissions = []) {
    if (pastSubmissions.length === 0) {
      return "medium"; // Default difficulty for new users
    }

    // Calculate average score from past submissions in this subject
    const subjectScores = pastSubmissions
      .filter((sub) => sub.quiz && sub.quiz.subject === subject)
      .map((sub) => sub.score);

    if (subjectScores.length === 0) {
      return "medium";
    }

    const averageScore =
      subjectScores.reduce((a, b) => a + b, 0) / subjectScores.length;

    // Adaptive difficulty logic
    if (averageScore >= 85) {
      return "hard";
    } else if (averageScore >= 65) {
      return "medium";
    } else {
      return "easy";
    }
  }

  // Analyze learning patterns and suggest focus areas
  async analyzeLearningPattern(submissions, subject) {
    if (submissions.length < 3) {
      return {
        trend: "insufficient_data",
        recommendation: "Take more quizzes to establish learning patterns",
      };
    }

    const recentScores = submissions.slice(-5).map((s) => s.score);
    const isImproving = recentScores[recentScores.length - 1] > recentScores[0];
    const averageScore =
      recentScores.reduce((a, b) => a + b, 0) / recentScores.length;

    return {
      trend: isImproving ? "improving" : "stable",
      averageScore: Math.round(averageScore),
      recommendation: isImproving
        ? `Keep up the great progress in ${subject}!`
        : `Consider varying your study approach for ${subject}.`,
    };
  }
}

export default new AIService();
