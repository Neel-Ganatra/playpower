#!/usr/bin/env node
import prisma from "./src/services/db.js";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Colors for console output
const colors = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
  reset: "\x1b[0m",
};

async function inspectDatabase() {
  console.log(
    `${colors.cyan}🔍 AI Quizzer Database Inspector${colors.reset}\n`
  );

  try {
    // Test database connection
    console.log(
      `${colors.blue}📡 Testing Database Connection...${colors.reset}`
    );
    await prisma.$connect();
    console.log(
      `${colors.green}✅ Connected to database successfully${colors.reset}\n`
    );

    // Get users
    console.log(`${colors.blue}👥 Users Table:${colors.reset}`);
    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: { submissions: true },
        },
      },
    });

    if (users.length === 0) {
      console.log(`${colors.yellow}  No users found${colors.reset}`);
    } else {
      users.forEach((user, index) => {
        console.log(
          `  ${index + 1}. ${colors.green}${user.username}${
            colors.reset
          } (ID: ${user.id})`
        );
        console.log(`     Created: ${user.createdAt.toLocaleDateString()}`);
        console.log(`     Submissions: ${user._count.submissions}`);
      });
    }
    console.log("");

    // Get quizzes
    console.log(`${colors.blue}📚 Quizzes Table:${colors.reset}`);
    const quizzes = await prisma.quiz.findMany({
      include: {
        _count: {
          select: { submissions: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (quizzes.length === 0) {
      console.log(`${colors.yellow}  No quizzes found${colors.reset}`);
    } else {
      quizzes.forEach((quiz, index) => {
        console.log(
          `  ${index + 1}. ${colors.magenta}${quiz.subject}${
            colors.reset
          } - Grade ${quiz.grade} (ID: ${quiz.id})`
        );
        console.log(`     Created: ${quiz.createdAt.toLocaleDateString()}`);
        console.log(
          `     Questions: ${
            Array.isArray(quiz.questions) ? quiz.questions.length : "N/A"
          }`
        );
        console.log(`     Submissions: ${quiz._count.submissions}`);

        // Show first question as sample
        if (Array.isArray(quiz.questions) && quiz.questions.length > 0) {
          const firstQ = quiz.questions[0];
          console.log(
            `     Sample Q: "${firstQ.question?.substring(0, 50)}..."`
          );
        }
      });
    }
    console.log("");

    // Get submissions
    console.log(`${colors.blue}✍️ Submissions Table:${colors.reset}`);
    const submissions = await prisma.submission.findMany({
      include: {
        user: true,
        quiz: true,
      },
      orderBy: { createdAt: "desc" },
      take: 10, // Show last 10 submissions
    });

    if (submissions.length === 0) {
      console.log(`${colors.yellow}  No submissions found${colors.reset}`);
    } else {
      submissions.forEach((submission, index) => {
        console.log(
          `  ${index + 1}. ${colors.green}${submission.user.username}${
            colors.reset
          } → ${colors.magenta}${submission.quiz.subject}${colors.reset} (ID: ${
            submission.id
          })`
        );
        console.log(
          `     Score: ${colors.cyan}${submission.score}%${colors.reset}`
        );
        console.log(
          `     Submitted: ${submission.createdAt.toLocaleDateString()} ${submission.createdAt.toLocaleTimeString()}`
        );
        console.log(
          `     Answers: ${
            Array.isArray(submission.answers) ? submission.answers.length : 0
          } provided`
        );
      });
    }
    console.log("");

    // Database statistics
    console.log(`${colors.blue}📊 Database Statistics:${colors.reset}`);
    const stats = {
      totalUsers: users.length,
      totalQuizzes: quizzes.length,
      totalSubmissions: submissions.length,
      subjects: [...new Set(quizzes.map((q) => q.subject))],
      grades: [...new Set(quizzes.map((q) => q.grade))],
      averageScore:
        submissions.length > 0
          ? (
              submissions.reduce((sum, sub) => sum + sub.score, 0) /
              submissions.length
            ).toFixed(1)
          : 0,
      highestScore:
        submissions.length > 0
          ? Math.max(...submissions.map((s) => s.score))
          : 0,
    };

    console.log(
      `  Total Users: ${colors.cyan}${stats.totalUsers}${colors.reset}`
    );
    console.log(
      `  Total Quizzes: ${colors.cyan}${stats.totalQuizzes}${colors.reset}`
    );
    console.log(
      `  Total Submissions: ${colors.cyan}${stats.totalSubmissions}${colors.reset}`
    );
    console.log(
      `  Subjects: ${colors.cyan}${stats.subjects.join(", ") || "None"}${
        colors.reset
      }`
    );
    console.log(
      `  Grades: ${colors.cyan}${stats.grades.join(", ") || "None"}${
        colors.reset
      }`
    );
    console.log(
      `  Average Score: ${colors.cyan}${stats.averageScore}%${colors.reset}`
    );
    console.log(
      `  Highest Score: ${colors.cyan}${stats.highestScore}%${colors.reset}`
    );
    console.log("");

    // Recent activity
    console.log(
      `${colors.blue}📈 Recent Activity (Last 5 days):${colors.reset}`
    );
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    const recentSubmissions = await prisma.submission.findMany({
      where: {
        createdAt: {
          gte: fiveDaysAgo,
        },
      },
      include: {
        user: true,
        quiz: true,
      },
      orderBy: { createdAt: "desc" },
    });

    if (recentSubmissions.length === 0) {
      console.log(`${colors.yellow}  No recent activity${colors.reset}`);
    } else {
      console.log(
        `  ${colors.cyan}${recentSubmissions.length}${colors.reset} submissions in last 5 days`
      );

      // Group by day
      const activityByDay = {};
      recentSubmissions.forEach((sub) => {
        const day = sub.createdAt.toLocaleDateString();
        if (!activityByDay[day]) activityByDay[day] = [];
        activityByDay[day].push(sub);
      });

      Object.entries(activityByDay).forEach(([day, subs]) => {
        console.log(`  ${day}: ${subs.length} submissions`);
      });
    }

    console.log(
      `\n${colors.cyan}🛠️ Database Management Commands:${colors.reset}`
    );
    console.log(
      `  ${colors.yellow}npx prisma studio${colors.reset}        - Open Prisma Studio (Database GUI)`
    );
    console.log(
      `  ${colors.yellow}npx prisma db push${colors.reset}       - Push schema changes to database`
    );
    console.log(
      `  ${colors.yellow}npx prisma migrate dev${colors.reset}   - Create and apply migrations`
    );
    console.log(
      `  ${colors.yellow}npx prisma db seed${colors.reset}       - Seed database with sample data`
    );
    console.log(
      `  ${colors.yellow}node inspect-db.js${colors.reset}       - Run this inspection again`
    );

    console.log(`\n${colors.cyan}📱 Direct MySQL Commands:${colors.reset}`);
    console.log(
      `  ${colors.yellow}mysql -u root -p${colors.reset}         - Connect to MySQL CLI`
    );
    console.log(
      `  ${colors.yellow}USE ai_quizzer;${colors.reset}          - Select the database`
    );
    console.log(
      `  ${colors.yellow}SHOW TABLES;${colors.reset}             - List all tables`
    );
    console.log(
      `  ${colors.yellow}DESCRIBE User;${colors.reset}           - Show User table structure`
    );
    console.log(
      `  ${colors.yellow}SELECT * FROM User;${colors.reset}      - View all users`
    );
    console.log(
      `  ${colors.yellow}SELECT * FROM Quiz LIMIT 5;${colors.reset} - View recent quizzes`
    );
  } catch (error) {
    console.error(
      `${colors.red}❌ Database inspection failed:${colors.reset}`,
      error.message
    );

    if (error.message.includes("ECONNREFUSED")) {
      console.log(`\n${colors.yellow}💡 Troubleshooting:${colors.reset}`);
      console.log("  1. Make sure MySQL server is running");
      console.log("  2. Check DATABASE_URL in .env file");
      console.log("  3. Verify database credentials");
      console.log("  4. Run: npx prisma db push");
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  inspectDatabase();
}

export { inspectDatabase };
