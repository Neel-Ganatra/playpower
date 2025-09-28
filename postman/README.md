# 🚀 AI Quizzer API - Postman Testing Guide

## 📦 Import Postman Collection

### Method 1: Import Files
1. Open Postman
2. Click **Import** button
3. Select both files:
   - `AI-Quizzer-API.postman_collection.json`
   - `AI-Quizzer-Environment.postman_environment.json`
4. Click **Import**

### Method 2: Import URLs (if hosted)
```
Collection: https://your-api-docs.com/postman/collection.json
Environment: https://your-api-docs.com/postman/environment.json
```

## 🎯 Testing Workflow

### Step 1: Set Environment
1. Click environment dropdown (top right)
2. Select **"AI Quizzer Development"**
3. Verify `baseUrl` is set to `http://localhost:4000`

### Step 2: Start Your Server
```bash
npm start
```

### Step 3: Run Tests in Order

#### 🏥 **Health & Info Tests**
1. **Health Check** - Verify server is running
2. **API Root Info** - Get available endpoints
3. **API Documentation** - Access Swagger docs

#### 🔐 **Authentication Tests**
1. **Login** - Get JWT token (automatically saved)
2. **Protected Route Test** - Verify authentication works

#### 📚 **Quiz Management Tests**
1. **Create Quiz (Math)** - Creates quiz with adaptive difficulty
2. **Create Quiz (Science)** - Create different subject quiz
3. **Submit Quiz** - Submit answers and get AI analysis
4. **Retry Quiz** - Test quiz retry functionality

#### 🔍 **Data & Analytics Tests**
1. **Get Quiz History** - View all user quizzes
2. **Get Quiz History (Filtered)** - Filter by grade/subject
3. **Get Quiz Analytics** - Performance statistics
4. **Get Subject Analytics** - Subject-specific analytics

#### 🤖 **AI Features Tests**
1. **Get Question Hint** - AI-generated hints
2. **Get Hint with User Answer** - Context-aware hints

#### 🚫 **Error Testing**
1. **Unauthorized Request** - Test without token
2. **Invalid Quiz ID** - Test error handling
3. **Invalid Route** - Test 404 responses
4. **Missing Required Fields** - Test validation

## 📊 Key Test Results to Check

### ✅ Successful Login Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Login successful"
}
```

### ✅ Quiz Creation Response:
```json
{
  "id": 1,
  "grade": "10",
  "subject": "Mathematics",
  "questions": [...],
  "difficulty": "medium",
  "adaptiveInfo": {
    "basedOnSubmissions": 0,
    "recommendedDifficulty": "medium"
  }
}
```

### ✅ Quiz Submission Response:
```json
{
  "id": 1,
  "score": 80,
  "scoreAnalysis": {
    "score": 80,
    "correct": 4,
    "total": 5,
    "analysis": [...]
  },
  "improvementSuggestions": [
    "Focus on algebra concepts...",
    "Practice more word problems..."
  ],
  "learningPattern": {
    "trend": "improving",
    "averageScore": 75
  }
}
```

### ✅ Analytics Response:
```json
{
  "analytics": {
    "totalQuizzes": 5,
    "averageScore": 78.5,
    "bestScore": 95,
    "subjectPerformance": {
      "Mathematics": {
        "average": 82.3,
        "count": 3
      }
    }
  }
}
```

## 🔧 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `baseUrl` | API server URL | `http://localhost:4000` |
| `authToken` | JWT token (auto-filled) | `eyJhbGciOiJIUzI1Ni...` |
| `quizId` | Current quiz ID (auto-filled) | `1` |
| `testUsername` | Login username | `testuser` |
| `testPassword` | Login password | `testpass123` |

## 🎨 Postman Collection Features

### 🔄 **Auto-Token Management**
- Login request automatically saves JWT token
- All protected routes use saved token
- No manual token copying needed

### 📝 **Auto-Variable Updates**
- Quiz creation saves quiz ID
- Automatically used in subsequent requests

### ✅ **Built-in Tests**
- Response time validation
- Status code checks
- Data validation
- Console logging

### 🎯 **Smart Request Chaining**
1. Login → Token saved
2. Create Quiz → Quiz ID saved  
3. Submit Quiz → Uses saved Quiz ID
4. Get Analytics → Shows updated stats

## 🐛 Troubleshooting

### ❌ **Server Connection Issues**
```json
{
  "error": "getaddrinfo ENOTFOUND localhost"
}
```
**Solution:** Make sure your server is running with `npm start`

### ❌ **Authentication Errors**
```json
{
  "error": "Token missing",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```
**Solution:** Run the Login request first to get a token

### ❌ **Database Errors**
```json
{
  "error": "Internal server error"
}
```
**Solution:** Check database connection and run `npx prisma db push`

## 📈 Advanced Testing

### **Load Testing**
- Use Postman Runner
- Set iterations: 10-100
- Monitor response times
- Check for errors

### **Data Validation**
- Verify all required fields
- Check data types
- Validate relationships
- Test edge cases

### **Security Testing**
- Test without authentication
- Try invalid tokens
- Test SQL injection attempts
- Validate input sanitization

## 🎪 Fun Testing Scenarios

### **Student Journey Test**
1. Login as student
2. Take multiple quizzes
3. Get worse, then better scores
4. Check analytics for improvement

### **Multi-Subject Performance**
1. Create Math quiz → Score 60%
2. Create Science quiz → Score 80%  
3. Create Math quiz again → Check adaptive difficulty
4. Verify difficulty increased for Math

### **AI Features Showcase**
1. Create challenging quiz
2. Get hints for difficult questions
3. Submit with improved answers
4. Review AI improvement suggestions

## 🏆 Expected Test Results

After running all tests successfully:
- ✅ 20+ requests completed
- ✅ All authentications working
- ✅ Quizzes created with adaptive difficulty
- ✅ AI features generating content
- ✅ Analytics showing performance data
- ✅ Error handling working properly

Happy Testing! 🎉