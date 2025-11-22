# Email Setup Guide

## 📧 Gmail App-Specific Password Setup

The API uses Gmail to send event approval notifications. Gmail requires an App-Specific Password for security.

### ⚠️ Current Error
```
Invalid login: 535-5.7.8 Username and Password not accepted
```

This means you need to set up an App-Specific Password.

## 🔧 Setup Steps (5 minutes)

### Step 1: Enable 2-Factor Authentication

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Click **"2-Step Verification"**
3. Click **"Get Started"**
4. Follow the prompts to set up 2FA (use your phone)
5. Complete the setup

### Step 2: Generate App-Specific Password

1. Go back to [Google Account Security](https://myaccount.google.com/security)
2. Click **"2-Step Verification"** again
3. Scroll down to **"App passwords"** section
4. Click **"App passwords"**
5. You may need to sign in again

6. In the "Select app" dropdown:
   - Choose **"Mail"**

7. In the "Select device" dropdown:
   - Choose **"Other (Custom name)"**
   - Enter: **"Ethiopian Volunteer API"**

8. Click **"Generate"**

9. You'll see a 16-character password like:
   ```
   abcd efgh ijkl mnop
   ```

10. **Copy this password** (you won't see it again!)

### Step 3: Update .env File

1. Open your `.env` file
2. Update the email configuration:
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=abcdefghijklmnop
   ```
   **Important**: Remove the spaces from the password!

3. Save the file

### Step 4: Restart Server

```bash
npm run dev
```

You should see:
```
✅ Email transporter is ready
```

## ✅ Verification

Test that email is working:

1. Create an event (as NGO)
2. Approve the event (as Admin)
3. Check if approval email was sent

## 🔄 Alternative Email Services

If you don't want to use Gmail, you can use other services:

### SendGrid
```env
EMAIL_SERVICE=sendgrid
EMAIL_USER=apikey
EMAIL_PASS=your_sendgrid_api_key
```

### Mailgun
```env
EMAIL_SERVICE=mailgun
EMAIL_USER=your_mailgun_username
EMAIL_PASS=your_mailgun_password
```

### Custom SMTP
```env
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your_username
EMAIL_PASS=your_password
```

## 🚫 Skip Email Setup (Development Only)

If you're just testing and don't need email notifications:

1. Leave the email settings as placeholders
2. The API will work fine
3. You'll see a warning: "Email credentials not configured"
4. Event approvals will work, but no emails will be sent

## 🆘 Troubleshooting

### "App passwords" option not showing
- Make sure 2-Factor Authentication is enabled
- Wait a few minutes after enabling 2FA
- Try signing out and back in

### Still getting authentication errors
- Make sure you removed spaces from the password
- Verify you're using the App-Specific Password, not your regular password
- Check that EMAIL_USER matches the Gmail account

### Password not working
- Generate a new App-Specific Password
- Make sure you copied the entire password
- Check for extra spaces or characters

## 📚 Additional Resources

- [Google App Passwords Help](https://support.google.com/accounts/answer/185833)
- [Gmail SMTP Settings](https://support.google.com/mail/answer/7126229)
- [Nodemailer Documentation](https://nodemailer.com/)

## 🎯 Quick Reference

**Gmail SMTP Settings:**
- Host: `smtp.gmail.com`
- Port: `587` (TLS) or `465` (SSL)
- Security: TLS/SSL
- Authentication: Required

**Environment Variables:**
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-char-app-password
```

---

**Need help?** See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) or create an issue.
