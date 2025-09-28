# 📧 EmailJS Setup Guide for AI Quizzer

EmailJS allows you to send emails directly from your frontend without server configuration - perfect for testing!

## 🚀 Quick Setup (5 minutes)

### Step 1: Create EmailJS Account
1. Go to [https://emailjs.com](https://emailjs.com)
2. Click "Sign Up" and create a free account
3. Verify your email address

### Step 2: Add Email Service
1. In your EmailJS dashboard, click **"Email Services"**
2. Click **"Add New Service"**
3. Choose your email provider:
   - **Gmail** (recommended) - just click connect
   - **Outlook/Hotmail** 
   - **Yahoo**
   - Or any other SMTP service
4. Follow the connection steps (no passwords needed for Gmail!)
5. **Copy the Service ID** (e.g., "service_abc123")

### Step 3: Create Email Template
1. Click **"Email Templates"** 
2. Click **"Create New Template"**
3. Set up your template:
   ```
   Subject: Quiz Results - {{quiz_subject}} (Score: {{score}}%)
   
   Template Content:
   Hello {{to_name}},
   
   Congratulations! Here are your quiz results:
   
   📚 Subject: {{quiz_subject}}
   🎯 Grade: {{quiz_grade}}  
   📊 Score: {{score}}% ({{correct_answers}}/{{total_questions}} correct)
   📅 Date: {{date}}
   
   {{message}}
   
   Keep up the great work!
   
   Best regards,
   AI Quizzer Team
   ```
4. **Copy the Template ID** (e.g., "template_xyz789")

### Step 4: Get Public Key
1. Go to **"Account"** → **"General"**
2. Find your **Public Key** (e.g., "abc123xyz789")

### Step 5: Update Frontend Configuration
1. Open `frontend-test.html`
2. Find this section in the JavaScript:
   ```javascript
   const EMAILJS_CONFIG = {
     publicKey: 'YOUR_PUBLIC_KEY', // Replace this
     serviceId: 'YOUR_SERVICE_ID', // Replace this  
     templateId: 'YOUR_TEMPLATE_ID' // Replace this
   };
   ```
3. Replace with your actual values:
   ```javascript
   const EMAILJS_CONFIG = {
     publicKey: 'abc123xyz789',
     serviceId: 'service_abc123',
     templateId: 'template_xyz789'
   };
   ```

## ✅ Test It!

1. Refresh your frontend page
2. Login → Create Quiz → Submit Quiz
3. Try sending an email - it should work instantly!
4. Check your email inbox

## 🎯 Benefits of EmailJS vs Server Email

| Feature | EmailJS | Server Email (Gmail SMTP) |
|---------|---------|---------------------------|
| Setup Time | 5 minutes | 15+ minutes |
| Security | OAuth (secure) | App passwords |
| Maintenance | Zero | Need to manage credentials |
| Rate Limits | 200 emails/month free | Gmail limits apply |
| Frontend Only | ✅ Yes | ❌ No, needs backend |

## 🆓 Free Tier Limits
- **200 emails per month** (perfect for testing)
- **Upgrade for more** if needed later

## 🔧 Troubleshooting

**"EmailJS is not defined" error:**
- Make sure the EmailJS script loads before your JavaScript

**Email not sending:**
- Check browser console for errors
- Verify all IDs are correct
- Test with a simple template first

**Template variables not working:**
- Make sure variable names match exactly (case-sensitive)
- Use `{{variable_name}}` syntax

## 📝 Template Variables Available

Your frontend sends these variables to EmailJS:
- `{{to_email}}` - Recipient email
- `{{to_name}}` - Always "Quiz Taker"
- `{{quiz_subject}}` - Math, Science, etc.
- `{{quiz_grade}}` - Grade level
- `{{score}}` - Score percentage
- `{{total_questions}}` - Number of questions
- `{{correct_answers}}` - Number correct
- `{{date}}` - Current date
- `{{message}}` - Congratulations message

## 🎉 Ready to Go!

Once configured, your AI Quizzer will send beautiful email reports instantly! No server configuration needed! 🚀