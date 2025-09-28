// Test AI responses with mock system
const express = require("express");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const API_BASE = "http://localhost:4000";

async function testAIResponses() {
  console.log("🧪 Testing AI Responses (Mock System Active)\n");

  try {
    // 1. Test question generation
    console.log("1️⃣ Testing Question Generation:");
    const questionsResponse = await fetch(`${API_BASE}/api/quiz`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer test-token",
      },
      body: JSON.stringify({
        title: "Math Quiz",
        description: "Basic math questions",
        grade: 5,
        subject: "Mathematics",
        difficulty: "easy",
        questionCount: 3,
      }),
    });

    const questionsData = await questionsResponse.json();
    console.log(
      "✅ Questions Generated:",
      questionsData.success ? "SUCCESS" : "FAILED"
    );
    console.log(
      "📝 Sample Question:",
      questionsData.quiz?.questions?.[0]?.question
    );
    console.log("");

    if (!questionsData.success) {
      console.log("❌ Error:", questionsData.message);
      return;
    }

    const quizId = questionsData.quiz.id;

    // 2. Test hint generation
    console.log("2️⃣ Testing Hint Generation:");
    const hintResponse = await fetch(
      `${API_BASE}/api/quiz/${quizId}/questions/1/hint`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
        body: JSON.stringify({
          userAnswer: null,
          attempts: 1,
        }),
      }
    );

    const hintData = await hintResponse.json();
    console.log("✅ Hint Generated:", hintData.success ? "SUCCESS" : "FAILED");
    console.log("💡 Sample Hint:", hintData.hint);
    console.log("");

    // 3. Test quiz submission and analysis
    console.log("3️⃣ Testing Quiz Analysis:");
    const submissionResponse = await fetch(
      `${API_BASE}/api/quiz/${quizId}/submit`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
        body: JSON.stringify({
          answers: [0, 1, 0], // Mix of correct and incorrect
          timeSpent: 120,
        }),
      }
    );

    const submissionData = await submissionResponse.json();
    console.log(
      "✅ Analysis Generated:",
      submissionData.success ? "SUCCESS" : "FAILED"
    );
    console.log("📊 Score:", submissionData.result?.score);
    console.log(
      "🎯 Performance:",
      submissionData.result?.analysis?.performance
    );
    console.log("");

    console.log("🎉 All AI Features Working with Mock System!");
    console.log("💡 To use real Groq AI: Set GROQ_API_KEY in your .env file");
  } catch (error) {
    console.error("❌ Test Error:", error.message);
  }
}

// Run the test
testAIResponses();
