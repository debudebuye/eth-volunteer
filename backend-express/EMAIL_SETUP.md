# Email Configuration Guide

This guide will help you set up email notifications for the Ethiopian Volunteer Platform.

## Gmail Setup (Recommended)

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account: https://myaccount.google.com/
2. Click on "Security" in the left sidebar
3. Under "Signing in to Google", enable "2-Step Verification"
4. Follow the prompts to set it up

### Step 2: Generate App-Specific Password
1. Go to: https://myaccount.google.com/apppasswords
2. Select "Mail" as the app
3. Select "Other (Custom name)" as the device
4. Enter "Ethiopian Volunteer Platform" as the name
5. Click "Generate"
6. Copy the 16-character password (it will look like: `xxxx xxxx xxxx xxxx`)

### Step 3: Update .env File
Open `backend-express/.env` and update:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx  # Paste the app password here
```

## Other Email Providers

### Outlook/Hotmail
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
```

### Yahoo Mail
```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USER=your-email@yahoo.com
EMAIL_PASSWORD=your-app-password
```

### Custom SMTP Server
```env
EMAIL_HOST=smtp.your-domain.com
EMAIL_PORT=587  # or 465 for SSL
EMAIL_USER=your-email@your-domain.com
EMAIL_PASSWORD=your-password
```

## Testing Email Configuration

After setting up, restart your backend server:
```bash
cd backend-express
npm run dev
```

The email service will automatically initialize and log the status.

## Email Features

### Event Approval Email
- Sent automatically when admin approves an event
- Includes event details and link to dashboard
- Beautiful HTML template with branding

### Event Rejection Email
- Sent automatically when admin rejects an event
- Includes event name and optional reason
- Professional notification template

## Troubleshooting

### "Invalid login" error
- Make sure you're using an App-Specific Password, not your regular password
- Verify 2-Factor Authentication is enabled
- Check that EMAIL_USER matches the account that generated the app password

### "Connection timeout" error
- Check your firewall settings
- Verify EMAIL_HOST and EMAIL_PORT are correct
- Try using port 465 with secure: true

### Emails not sending
- Check backend logs for error messages
- Verify EMAIL_USER and EMAIL_PASSWORD are set correctly
- Make sure the email address exists in the event's creatorEmail field

## Security Notes

⚠️ **IMPORTANT:**
- Never commit your actual EMAIL_PASSWORD to Git
- Use environment variables for all sensitive data
- Rotate app passwords periodically
- Use different passwords for development and production

## Support

If you encounter issues:
1. Check the backend logs: `backend-express/logs/`
2. Verify your .env configuration
3. Test with a simple email first
4. Check your email provider's SMTP documentation
