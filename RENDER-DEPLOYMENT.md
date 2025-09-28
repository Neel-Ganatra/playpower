# Render Environment Variables Configuration

## Required Environment Variables for Render:

### Database
DATABASE_URL=mysql://username:password@host:port/database_name
# Render will provide this when you create a MySQL database

### Redis
REDIS_URL=redis://username:password@host:port
# Render will provide this when you create a Redis instance

### Security
JWT_SECRET=your-super-secret-jwt-key-here
# Generate a strong random string (Render can auto-generate this)

### AI Service  
GROQ_API_KEY=your-groq-api-key-here
# Get this from https://console.groq.com

### Email (Optional)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
# Only needed if you want backend email functionality

### Application
NODE_ENV=production
PORT=4000
# Render automatically sets PORT, but we specify 4000 in Dockerfile

## Render Services Needed:

1. **Web Service** (Your main app)
   - Type: Web Service
   - Source: GitHub repository
   - Build: Docker
   - Port: 4000

2. **Database**
   - Type: PostgreSQL or MySQL
   - Plan: Starter ($7/month) or Free (limited)

3. **Redis** (Optional but recommended)
   - Type: Redis
   - Plan: Starter ($7/month) or Free (25MB)

## Total Monthly Cost:
- Free Tier: $0 (with limitations)
- Starter: ~$21/month (Web Service + Database + Redis)
- Professional: ~$46/month (better performance)