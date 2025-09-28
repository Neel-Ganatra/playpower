# AI Quizzer Backend

A comprehensive AI-powered quiz application backend with authentication, adaptive difficulty, intelligent evaluation, and advanced features.

## 🚀 Features

### Core Functionality
- **Mock Authentication**: JWT-based authentication accepting any username/password
- **AI-Powered Quiz Generation**: Dynamic quiz creation using Groq AI API
- **Adaptive Difficulty**: Real-time difficulty adjustment based on user performance
- **Intelligent Evaluation**: AI-powered scoring and analysis
- **Quiz Management**: Complete CRUD operations for quizzes and submissions
- **Performance Analytics**: Detailed user performance insights

### AI Features
- **Hint Generation**: AI provides contextual hints for questions
- **Improvement Suggestions**: Personalized learning recommendations
- **Adaptive Question Difficulty**: Adjusts based on past performance
- **Learning Pattern Analysis**: AI analyzes user learning trends

### Bonus Features
- **Email Notifications**: Send quiz results via email
- **Redis Caching**: Improved performance with caching layer
- **Leaderboard**: Top scores for grade/subject combinations
- **Comprehensive API Documentation**: Swagger/OpenAPI documentation

## 🛠️ Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MySQL with Prisma ORM
- **AI Integration**: Groq API (Llama 3 model)
- **Caching**: Redis
- **Email**: Nodemailer
- **Documentation**: Swagger/OpenAPI
- **Security**: Helmet, Rate Limiting, CORS
- **Containerization**: Docker

## 📋 Prerequisites

- Node.js 18 or higher
- MySQL 8.0 or higher
- Redis 6.0 or higher
- Docker (optional, for containerized deployment)

## 🚀 Quick Start

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd ai-quizzer-backend
npm install
```

### 2. Environment Configuration

Copy the environment template and configure your variables:

```bash
cp env.example .env
```

Edit `.env` with your configuration:

```env
# Database Configuration
DATABASE_URL="mysql://root:password@localhost:3306/ai_quizzer"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# Groq AI API Configuration
GROQ_API_KEY="your-groq-api-key-here"

# Redis Configuration
REDIS_URL="redis://localhost:6379"

# Email Configuration
EMAIL_SERVICE="gmail"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"

# Application URLs
FRONTEND_URL="http://localhost:3000"
API_URL="http://localhost:4000"
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Or run migrations
npm run db:migrate
```

### 4. Start the Application

```bash
# Development mode
npm start

# Or with Docker Compose
docker-compose up -d
```

The API will be available at `http://localhost:4000`

## 📚 API Documentation

### Swagger UI
Visit `http://localhost:4000/api-docs` for interactive API documentation.

### Authentication
All quiz endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Core Endpoints

#### Authentication
- `POST /login` - Authenticate and get JWT token

#### Quiz Management
- `POST /quiz/create` - Create AI-generated quiz
- `GET /quiz/history` - Get quiz history with filters
- `POST /quiz/:id/submit` - Submit quiz answers
- `POST /quiz/:id/retry` - Retry a quiz
- `GET /quiz/analytics` - Get performance analytics

#### AI Features
- `POST /quiz/:quizId/question/:questionId/hint` - Get AI hint

#### Leaderboard
- `GET /quiz/leaderboard` - Get leaderboard for grade/subject

#### Notifications
- `POST /quiz/send-email` - Send quiz results via email

## 🔧 AI Integration Details

### Groq API Configuration
The application uses Groq's Llama 3 model for:
- Question generation with adaptive difficulty
- Hint generation for individual questions
- Improvement suggestions based on performance
- Learning pattern analysis

### Model Used
- **Model**: `llama3-8b-8192`
- **Temperature**: 0.6-0.7 (for balanced creativity/consistency)
- **Max Tokens**: 2000 (for question generation)

### Fallback Mechanism
If the AI service is unavailable, the application falls back to mock implementations to ensure reliability.

## 🗄️ Database Schema

### Tables
- **User**: Stores user information
- **Quiz**: Stores quiz data with AI-generated questions
- **Submission**: Stores user submissions and scores

### Key Features
- JSON storage for flexible question/answer data
- Timestamps for tracking
- Foreign key relationships for data integrity

## 🚀 Deployment

### Docker Deployment

1. **Build the image**:
```bash
docker build -t ai-quizzer-backend .
```

2. **Run with Docker Compose**:
```bash
docker-compose up -d
```

### Environment Variables for Production

Ensure all environment variables are properly set:
- Use strong JWT secrets
- Configure production database URLs
- Set up proper email credentials
- Configure Redis for caching

### Hosting Platforms

The application is designed to work with:
- **Heroku**: Use Heroku Postgres and Redis add-ons
- **DigitalOcean**: Deploy with App Platform
- **AWS**: Use RDS for MySQL, ElastiCache for Redis
- **Railway**: Direct deployment with environment variables

## 📊 Performance Features

### Caching Strategy
- **Quiz Data**: Cached for 1 hour
- **User History**: Cached for 30 minutes
- **Leaderboards**: Cached for 5 minutes
- **Analytics**: Cached for 15 minutes

### Rate Limiting
- 100 requests per 15 minutes per IP
- Configurable limits for different endpoints

## 🔒 Security Features

- **Helmet.js**: Security headers
- **Rate Limiting**: DDoS protection
- **CORS**: Cross-origin request handling
- **JWT**: Secure token-based authentication
- **Input Validation**: Request validation and sanitization

## 🧪 Testing

### Sample API Calls

#### 1. Login
```bash
curl -X POST http://localhost:4000/login \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "password123"}'
```

#### 2. Create Quiz
```bash
curl -X POST http://localhost:4000/quiz/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"grade": "5", "subject": "Mathematics", "questionCount": 5}'
```

#### 3. Submit Quiz
```bash
curl -X POST http://localhost:4000/quiz/1/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"answers": [0, 2, 1, 0, 3]}'
```

## 📝 Postman Collection

A comprehensive Postman collection is available with:
- All API endpoints
- Sample requests and responses
- Authentication setup
- Environment variables

## 🐛 Known Issues

1. **AI Service Fallback**: If Groq API is unavailable, mock responses are used
2. **Email Configuration**: Requires proper SMTP configuration for production
3. **Redis Dependency**: Application works without Redis but with reduced performance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is part of a technical assessment for PlayPower Labs.

## 📞 Support

For any questions or issues, contact: hiring.support@playpowerlabs.com

---

**Note**: This is a technical assessment project. Please ensure all sensitive information (API keys, passwords) is properly secured in production environments.
