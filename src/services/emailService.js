import nodemailer from "nodemailer";

class EmailService {
  constructor() {
    // Only create transporter if email credentials are configured
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      this.transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
      this.isConfigured = true;
      console.log("✅ Email service configured");
    } else {
      this.transporter = null;
      this.isConfigured = false;
      console.log(
        "⚠️ Email service not configured - EMAIL_USER and EMAIL_PASS missing"
      );
    }
  }

  async sendQuizResults(email, quizData, scoreData) {
    // Check if email service is configured
    if (!this.isConfigured) {
      console.log("📧 Email not configured - skipping email send");
      return false;
    }
    try {
      const { username, quiz, score, improvementSuggestions } = quizData;
      const { correct, total, analysis } = scoreData;

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: `Quiz Results - ${quiz.subject} (Grade ${quiz.grade})`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Quiz Results</h2>
            <p>Hello ${username},</p>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Quiz Summary</h3>
              <p><strong>Subject:</strong> ${quiz.subject}</p>
              <p><strong>Grade Level:</strong> ${quiz.grade}</p>
              <p><strong>Score:</strong> ${score}% (${correct}/${total} correct)</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>

            <div style="background-color: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #2e7d32;">Performance Analysis</h3>
              <p>${
                score >= 80
                  ? "Excellent work! You demonstrated strong understanding."
                  : score >= 60
                  ? "Good job! There's room for improvement."
                  : "Keep practicing! Focus on the fundamentals."
              }</p>
            </div>

            ${
              improvementSuggestions && improvementSuggestions.length > 0
                ? `
            <div style="background-color: #fff3e0; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #f57c00;">Improvement Suggestions</h3>
              <ul>
                ${improvementSuggestions
                  .map((suggestion) => `<li>${suggestion}</li>`)
                  .join("")}
              </ul>
            </div>
            `
                : ""
            }

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}" 
                 style="background-color: #1976d2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Take Another Quiz
              </a>
            </div>

            <p style="color: #666; font-size: 14px;">
              Keep up the great work! Practice regularly to improve your skills.
            </p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Quiz results email sent to ${email}`);
      return true;
    } catch (error) {
      console.error("Error sending email:", error);
      return false;
    }
  }

  async sendWelcomeEmail(email, username) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Welcome to AI Quizzer!",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Welcome to AI Quizzer!</h2>
            <p>Hello ${username},</p>
            
            <p>Welcome to our AI-powered quiz platform! You can now:</p>
            <ul>
              <li>Take personalized quizzes based on your grade level</li>
              <li>Get AI-generated hints when you need help</li>
              <li>Receive improvement suggestions after each quiz</li>
              <li>Track your progress over time</li>
            </ul>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}" 
                 style="background-color: #1976d2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Start Your First Quiz
              </a>
            </div>

            <p style="color: #666; font-size: 14px;">
              Happy learning!
            </p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Welcome email sent to ${email}`);
      return true;
    } catch (error) {
      console.error("Error sending welcome email:", error);
      return false;
    }
  }
}

export default new EmailService();
