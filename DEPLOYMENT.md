# AI Quizzer Backend - Deployment Guide

## 🚀 Quick Deployment Options

### Option 1: Docker Compose (Recommended for Development)

1. **Clone and Setup**:
```bash
git clone <repository-url>
cd ai-quizzer-backend
cp env.example .env
# Edit .env with your configuration
```

2. **Start Services**:
```bash
docker-compose up -d
```

3. **Initialize Database**:
```bash
docker-compose exec app npm run db:push
```

4. **Access the API**:
- API: http://localhost:4000
- Documentation: http://localhost:4000/api-docs
- Health Check: http://localhost:4000/health

### Option 2: Manual Deployment

1. **Prerequisites**:
   - Node.js 18+
   - MySQL 8.0+
   - Redis 6.0+

2. **Setup**:
```bash
npm install
cp env.example .env
# Configure .env file
npm run db:generate
npm run db:push
npm start
```

### Option 3: Cloud Deployment

#### Heroku Deployment

1. **Create Heroku App**:
```bash
heroku create your-app-name
```

2. **Add Add-ons**:
```bash
heroku addons:create heroku-postgresql:hobby-dev
heroku addons:create heroku-redis:hobby-dev
```

3. **Set Environment Variables**:
```bash
heroku config:set JWT_SECRET=your-secret-key
heroku config:set GROQ_API_KEY=your-groq-key
heroku config:set EMAIL_USER=your-email@gmail.com
heroku config:set EMAIL_PASS=your-app-password
```

4. **Deploy**:
```bash
git push heroku main
heroku run npm run db:push
```

#### Railway Deployment

1. **Connect Repository**:
   - Go to Railway.app
   - Connect your GitHub repository
   - Select the project

2. **Configure Environment**:
   - Add all required environment variables
   - Railway will automatically detect the Node.js app

3. **Database Setup**:
   - Add MySQL service
   - Update DATABASE_URL in environment variables

4. **Deploy**:
   - Railway will automatically build and deploy

#### DigitalOcean App Platform

1. **Create App**:
   - Go to DigitalOcean App Platform
   - Connect your GitHub repository
   - Select Node.js as the runtime

2. **Configure Services**:
   - Add MySQL database
   - Add Redis cache
   - Configure environment variables

3. **Deploy**:
   - DigitalOcean will handle the deployment automatically

## 🔧 Environment Configuration

### Required Environment Variables

```env
# Database
DATABASE_URL="mysql://user:password@host:port/database"

# JWT Authentication
JWT_SECRET="your-super-secret-jwt-key"

# AI Service (Groq)
GROQ_API_KEY="your-groq-api-key"

# Redis Cache
REDIS_URL="redis://host:port"

# Email Service
EMAIL_SERVICE="gmail"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"

# Application URLs
FRONTEND_URL="https://your-frontend.com"
API_URL="https://your-api.com"
```

### Optional Environment Variables

```env
# Port (default: 4000)
PORT=4000

# Environment (default: development)
NODE_ENV=production

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🗄️ Database Setup

### MySQL Configuration

1. **Create Database**:
```sql
CREATE DATABASE ai_quizzer;
CREATE USER 'quizzer_user'@'%' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON ai_quizzer.* TO 'quizzer_user'@'%';
FLUSH PRIVILEGES;
```

2. **Run Migrations**:
```bash
npm run db:push
# or
npm run db:migrate
```

### Redis Configuration

1. **Install Redis**:
```bash
# Ubuntu/Debian
sudo apt-get install redis-server

# macOS
brew install redis

# Docker
docker run -d -p 6379:6379 redis:alpine
```

2. **Configure Redis**:
```bash
# Start Redis
redis-server

# Test connection
redis-cli ping
```

## 📧 Email Configuration

### Gmail Setup

1. **Enable 2-Factor Authentication**
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"

3. **Configure Environment**:
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password
```

### Other Email Providers

```env
# SMTP Configuration
EMAIL_SERVICE=smtp
EMAIL_HOST=smtp.your-provider.com
EMAIL_PORT=587
EMAIL_USER=your-email@domain.com
EMAIL_PASS=your-password
```

## 🔒 Security Considerations

### Production Security Checklist

- [ ] Change default JWT secret
- [ ] Use strong database passwords
- [ ] Enable SSL/TLS
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Use environment variables for secrets
- [ ] Enable database encryption
- [ ] Set up monitoring and logging

### SSL/TLS Setup

1. **Obtain SSL Certificate**:
   - Use Let's Encrypt (free)
   - Or purchase from certificate authority

2. **Configure HTTPS**:
```javascript
// Add to your server configuration
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('path/to/private-key.pem'),
  cert: fs.readFileSync('path/to/certificate.pem')
};

https.createServer(options, app).listen(443);
```

## 📊 Monitoring and Logging

### Health Checks

The API provides several health check endpoints:

- `GET /health` - Basic health check
- `GET /api-docs` - API documentation

### Logging

Configure logging for production:

```javascript
// Add to your server configuration
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Failed**:
   - Check DATABASE_URL format
   - Verify database server is running
   - Check network connectivity

2. **Redis Connection Failed**:
   - Verify REDIS_URL
   - Check Redis server status
   - Test with `redis-cli ping`

3. **Email Sending Failed**:
   - Verify email credentials
   - Check SMTP settings
   - Test with a simple email

4. **AI Service Errors**:
   - Verify GROQ_API_KEY
   - Check API quota/limits
   - Review error logs

### Debug Mode

Enable debug mode for troubleshooting:

```env
NODE_ENV=development
DEBUG=app:*
```

## 📈 Performance Optimization

### Caching Strategy

- **Quiz Data**: 1 hour TTL
- **User History**: 30 minutes TTL
- **Leaderboards**: 5 minutes TTL
- **Analytics**: 15 minutes TTL

### Database Optimization

1. **Add Indexes**:
```sql
CREATE INDEX idx_submissions_user_id ON Submission(userId);
CREATE INDEX idx_submissions_quiz_id ON Submission(quizId);
CREATE INDEX idx_submissions_score ON Submission(score);
CREATE INDEX idx_quizzes_grade_subject ON Quiz(grade, subject);
```

2. **Connection Pooling**:
```javascript
// Configure Prisma connection pool
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + "?connection_limit=20&pool_timeout=20"
    }
  }
});
```

## 🔄 Backup and Recovery

### Database Backup

```bash
# Create backup
mysqldump -u username -p ai_quizzer > backup.sql

# Restore backup
mysql -u username -p ai_quizzer < backup.sql
```

### Automated Backups

Set up automated daily backups:

```bash
# Add to crontab
0 2 * * * mysqldump -u username -p ai_quizzer > /backups/ai_quizzer_$(date +\%Y\%m\%d).sql
```

## 📞 Support

For deployment issues or questions:

- **Email**: hiring.support@playpowerlabs.com
- **Documentation**: Check the README.md
- **API Docs**: Visit `/api-docs` endpoint

---

**Note**: This deployment guide covers the most common scenarios. Adjust configurations based on your specific infrastructure and requirements.
