# 🗄️ MySQL Workbench Setup for AI Quizzer

## 📊 Database Connection Setup

### Step 1: Install MySQL Workbench
1. Download from: https://dev.mysql.com/downloads/workbench/
2. Install MySQL Workbench
3. Open MySQL Workbench

### Step 2: Create New Connection
1. Click **"+"** next to "MySQL Connections"
2. Fill in connection details:

```
Connection Name: AI Quizzer Database
Connection Method: Standard (TCP/IP)
Hostname: localhost
Port: 3306 (or your MySQL port)
Username: root (or your MySQL username)
Password: [Store in Vault] → Enter your MySQL password
Default Schema: ai_quizzer
```

### Step 3: Test Connection
1. Click **"Test Connection"**
2. Enter password if prompted
3. Should show: "Successfully made the MySQL connection"

### Step 4: Connect to Database
1. Double-click your connection
2. You should see the `ai_quizzer` database in the left panel

## 📈 Database Tables Overview

### Tables Created by Prisma:
- **User** - Stores user accounts
- **Quiz** - Stores quiz information and questions
- **Submission** - Stores quiz submissions and scores
- **_prisma_migrations** - Migration history

## 🔍 Useful SQL Queries for MySQL Workbench

### View All Tables
```sql
USE ai_quizzer;
SHOW TABLES;
```

### User Management
```sql
-- View all users
SELECT * FROM User;

-- User with submission count
SELECT 
    u.id,
    u.username,
    u.createdAt,
    COUNT(s.id) as total_submissions,
    AVG(s.score) as average_score
FROM User u 
LEFT JOIN Submission s ON u.id = s.userId 
GROUP BY u.id, u.username, u.createdAt;
```

### Quiz Analysis
```sql
-- View all quizzes
SELECT * FROM Quiz ORDER BY createdAt DESC;

-- Quiz with submission statistics
SELECT 
    q.id,
    q.grade,
    q.subject,
    q.createdAt,
    COUNT(s.id) as total_submissions,
    AVG(s.score) as average_score,
    MAX(s.score) as highest_score
FROM Quiz q 
LEFT JOIN Submission s ON q.id = s.quizId 
GROUP BY q.id, q.grade, q.subject, q.createdAt
ORDER BY q.createdAt DESC;

-- Popular subjects
SELECT 
    subject,
    COUNT(*) as quiz_count,
    AVG(s.score) as avg_score
FROM Quiz q
LEFT JOIN Submission s ON q.id = s.quizId
GROUP BY subject
ORDER BY quiz_count DESC;
```

### Submission Analysis
```sql
-- Recent submissions
SELECT 
    s.id,
    u.username,
    q.subject,
    q.grade,
    s.score,
    s.createdAt
FROM Submission s
JOIN User u ON s.userId = u.id
JOIN Quiz q ON s.quizId = q.id
ORDER BY s.createdAt DESC
LIMIT 20;

-- Performance by grade
SELECT 
    q.grade,
    COUNT(s.id) as total_attempts,
    AVG(s.score) as average_score,
    MIN(s.score) as lowest_score,
    MAX(s.score) as highest_score
FROM Submission s
JOIN Quiz q ON s.quizId = q.id
GROUP BY q.grade
ORDER BY q.grade;

-- User performance trends
SELECT 
    u.username,
    DATE(s.createdAt) as date,
    AVG(s.score) as daily_average
FROM Submission s
JOIN User u ON s.userId = u.id
GROUP BY u.username, DATE(s.createdAt)
ORDER BY u.username, date;
```

### Performance Monitoring
```sql
-- Database size and stats
SELECT 
    table_name,
    table_rows,
    ROUND(((data_length + index_length) / 1024 / 1024), 2) as 'Size (MB)'
FROM information_schema.tables 
WHERE table_schema = 'ai_quizzer'
ORDER BY table_rows DESC;

-- Quiz difficulty analysis (if stored in questions JSON)
SELECT 
    q.subject,
    JSON_EXTRACT(q.questions, '$[0].difficulty') as difficulty_level,
    COUNT(*) as count,
    AVG(s.score) as avg_score
FROM Quiz q
LEFT JOIN Submission s ON q.id = s.quizId
GROUP BY q.subject, JSON_EXTRACT(q.questions, '$[0].difficulty');
```

### Data Cleanup Queries
```sql
-- Delete test data (BE CAREFUL!)
-- DELETE FROM Submission WHERE userId IN (SELECT id FROM User WHERE username LIKE 'test%');
-- DELETE FROM User WHERE username LIKE 'test%';

-- Reset auto-increment (after cleanup)
-- ALTER TABLE User AUTO_INCREMENT = 1;
-- ALTER TABLE Quiz AUTO_INCREMENT = 1;
-- ALTER TABLE Submission AUTO_INCREMENT = 1;
```

## 🎨 MySQL Workbench Tips

### Visual Query Builder
1. Right-click on table → "Select Rows - Limit 1000"
2. Use the query builder for complex joins
3. Export results to CSV/Excel for analysis

### Performance Analysis
1. Query → Explain → Visual Explain
2. Check execution time in bottom panel
3. Use indexes for better performance

### Data Visualization
1. Use MySQL Workbench's built-in charts
2. Export data to external tools
3. Create custom reports

## 🔧 Database Maintenance

### Backup Database
```sql
-- Create backup (run in terminal)
mysqldump -u root -p ai_quizzer > ai_quizzer_backup.sql
```

### Restore Database
```sql
-- Restore from backup (run in terminal)
mysql -u root -p ai_quizzer < ai_quizzer_backup.sql
```

### Monitor Performance
```sql
-- Show process list
SHOW PROCESSLIST;

-- Show database status
SHOW STATUS LIKE 'Threads_connected';
SHOW STATUS LIKE 'Questions';
```

## 🚀 Integration with Your API Testing

### After Running Postman Tests:
1. Refresh MySQL Workbench
2. Run user queries to see new test users
3. Check quiz submissions and scores
4. Analyze performance trends
5. Verify data integrity

### Before Production:
1. Create proper indexes
2. Set up regular backups
3. Monitor query performance
4. Plan for scaling

This setup gives you complete visibility into your AI Quizzer database! 📊