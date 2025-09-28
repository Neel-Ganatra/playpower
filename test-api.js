// Simple API test script
const baseUrl = 'http://localhost:4000';

async function testAPI() {
  console.log('🧪 Testing AI Quizzer API...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing Health Check...');
    const healthResponse = await fetch(`${baseUrl}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health Check:', healthData);
    console.log('');

    // Test 2: Login
    console.log('2. Testing Login...');
    const loginResponse = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'testuser',
        password: 'password123'
      })
    });
    const loginData = await loginResponse.json();
    console.log('✅ Login Response:', loginData);
    console.log('');

    if (loginData.token) {
      const token = loginData.token;
      console.log('🔑 JWT Token received:', token.substring(0, 50) + '...');
      console.log('');

      // Test 3: Create Quiz
      console.log('3. Testing Create Quiz...');
      const quizResponse = await fetch(`${baseUrl}/quiz/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          grade: '5',
          subject: 'Mathematics',
          questionCount: 3
        })
      });
      const quizData = await quizResponse.json();
      console.log('✅ Quiz Created:', {
        id: quizData.id,
        grade: quizData.grade,
        subject: quizData.subject,
        questionCount: quizData.questions?.length || 0,
        difficulty: quizData.difficulty
      });
      console.log('');

      if (quizData.id) {
        const quizId = quizData.id;
        
        // Test 4: Submit Quiz
        console.log('4. Testing Submit Quiz...');
        const submitResponse = await fetch(`${baseUrl}/quiz/${quizId}/submit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            answers: [0, 1, 2] // Sample answers
          })
        });
        const submitData = await submitResponse.json();
        console.log('✅ Quiz Submitted:', {
          score: submitData.score,
          correct: submitData.scoreAnalysis?.correct || 0,
          total: submitData.scoreAnalysis?.total || 0,
          improvementSuggestions: submitData.improvementSuggestions?.length || 0
        });
        console.log('');

        // Test 5: Get Quiz History
        console.log('5. Testing Quiz History...');
        const historyResponse = await fetch(`${baseUrl}/quiz/history?grade=5&subject=Mathematics`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const historyData = await historyResponse.json();
        console.log('✅ Quiz History:', {
          totalQuizzes: historyData.length,
          latestQuiz: historyData[0] ? {
            id: historyData[0].id,
            subject: historyData[0].subject,
            submissions: historyData[0].submissions?.length || 0
          } : null
        });
        console.log('');

        // Test 6: Get Analytics
        console.log('6. Testing Analytics...');
        const analyticsResponse = await fetch(`${baseUrl}/quiz/analytics`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const analyticsData = await analyticsResponse.json();
        console.log('✅ Analytics:', {
          totalQuizzes: analyticsData.analytics?.totalQuizzes || 0,
          averageScore: analyticsData.analytics?.averageScore || 0,
          bestScore: analyticsData.analytics?.bestScore || 0
        });
        console.log('');

        // Test 7: Get Leaderboard
        console.log('7. Testing Leaderboard...');
        const leaderboardResponse = await fetch(`${baseUrl}/quiz/leaderboard?grade=5&subject=Mathematics&limit=5`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const leaderboardData = await leaderboardResponse.json();
        console.log('✅ Leaderboard:', {
          totalParticipants: leaderboardData.totalParticipants || 0,
          topScores: leaderboardData.leaderboard?.slice(0, 3).map(entry => ({
            rank: entry.rank,
            username: entry.username,
            score: entry.score
          })) || []
        });
        console.log('');

        // Test 8: Get Hint
        console.log('8. Testing Hint Generation...');
        const hintResponse = await fetch(`${baseUrl}/quiz/${quizId}/question/1/hint`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            userAnswer: 1
          })
        });
        const hintData = await hintResponse.json();
        console.log('✅ Hint Generated:', {
          questionId: hintData.questionId,
          hint: hintData.hint?.substring(0, 100) + '...',
          confidence: hintData.confidence
        });
        console.log('');

      }
    }

    console.log('🎉 All tests completed successfully!');
    console.log('\n📚 API Documentation: http://localhost:4000/api-docs');
    console.log('🏥 Health Check: http://localhost:4000/health');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the tests
testAPI();
