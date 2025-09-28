// Quick test for the hint endpoint fix
import fetch from "node-fetch";

const baseUrl = "http://localhost:4000";

async function testHintEndpoint() {
  console.log("🧪 Testing Hint Endpoint Fix...\n");

  try {
    // 1. Login first
    console.log("1. Logging in...");
    const loginResponse = await fetch(`${baseUrl}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "testuser",
        password: "testpass123",
      }),
    });

    const loginData = await loginResponse.json();
    if (!loginData.token) {
      throw new Error("Login failed");
    }
    console.log("✅ Login successful");

    // 2. Create a quiz
    console.log("2. Creating quiz...");
    const quizResponse = await fetch(`${baseUrl}/quiz/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${loginData.token}`,
      },
      body: JSON.stringify({
        grade: "10",
        subject: "Mathematics",
        questionCount: 3,
      }),
    });

    const quizData = await quizResponse.json();
    if (!quizData.id) {
      throw new Error("Quiz creation failed");
    }
    console.log("✅ Quiz created with ID:", quizData.id);

    // 3. Test hint with null userAnswer
    console.log("3. Testing hint with null userAnswer...");
    const hintResponse1 = await fetch(
      `${baseUrl}/quiz/${quizData.id}/question/1/hint`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${loginData.token}`,
        },
        body: JSON.stringify({
          userAnswer: null,
        }),
      }
    );

    const hintData1 = await hintResponse1.json();
    if (hintResponse1.ok) {
      console.log("✅ Hint with null userAnswer successful");
      console.log("   Hint:", hintData1.hint.substring(0, 50) + "...");
    } else {
      console.log("❌ Hint with null failed:", hintData1);
    }

    // 4. Test hint without userAnswer (missing field)
    console.log("4. Testing hint without userAnswer field...");
    const hintResponse2 = await fetch(
      `${baseUrl}/quiz/${quizData.id}/question/1/hint`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${loginData.token}`,
        },
        body: JSON.stringify({}),
      }
    );

    const hintData2 = await hintResponse2.json();
    if (hintResponse2.ok) {
      console.log("✅ Hint without userAnswer field successful");
      console.log("   Hint:", hintData2.hint.substring(0, 50) + "...");
    } else {
      console.log("❌ Hint without userAnswer failed:", hintData2);
    }

    // 5. Test hint with valid userAnswer
    console.log("5. Testing hint with valid userAnswer (2)...");
    const hintResponse3 = await fetch(
      `${baseUrl}/quiz/${quizData.id}/question/1/hint`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${loginData.token}`,
        },
        body: JSON.stringify({
          userAnswer: 2,
        }),
      }
    );

    const hintData3 = await hintResponse3.json();
    if (hintResponse3.ok) {
      console.log("✅ Hint with valid userAnswer successful");
      console.log("   Hint:", hintData3.hint.substring(0, 50) + "...");
      console.log("   Is Specific:", hintData3.isSpecific);
    } else {
      console.log("❌ Hint with valid userAnswer failed:", hintData3);
    }

    console.log("\n🎉 All hint tests completed!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

// Run the test
testHintEndpoint();
