# Gmail API Setup Instructions

This guide will help you configure Gmail API to send invitation emails from Promage Pro.

## Prerequisites

✅ You've already enabled Gmail API in Google Cloud Console  
✅ You have your Google Client ID and Secret (already in `.env`)

## Steps to Get Gmail Refresh Token

### 1. Go to OAuth 2.0 Playground

Visit: [https://developers.google.com/oauthplayground/](https://developers.google.com/oauthplayground/)

### 2. Configure OAuth Settings

1. Click the ⚙️ gear icon (top right)
2. Check ✅ **"Use your own OAuth credentials"**
3. Enter your credentials:
   - **OAuth Client ID**: `582203893294-9amv0glnqhfa1vqfpmeb6s53oisst2hu.apps.googleusercontent.com`
   - **OAuth Client Secret**: `YOUR_CLIENT_SECRET`
4. Click **Close**

### 3. Select Gmail API Scope

1. In the left sidebar, find **"Gmail API v1"**
2. Expand it and check:
   - ✅ `https://mail.google.com/` (Full Gmail access)
   
   OR for more restrictive access:
   
   - ✅ `https://www.googleapis.com/auth/gmail.send` (Send only)

3. Click **"Authorize APIs"** button

### 4. Authorize with Your Google Account

1. Select the Google account you want to send emails from
2. Click **"Allow"** to grant permissions
3. You'll be redirected back to the playground

### 5. Get the Refresh Token

1. Click **"Exchange authorization code for tokens"** button
2. You'll see a JSON response with:
   ```json
   {
     "access_token": "...",
     "refresh_token": "1//0gXXXXXXXXXXXX...",
     "expires_in": 3599,
     "token_type": "Bearer"
   }
   ```
3. **Copy the `refresh_token` value** (starts with `1//0g...`)

### 6. Update Your `.env` File

Open `server/.env` and update:

```env
EMAIL_USER=your-actual-email@gmail.com
GMAIL_REFRESH_TOKEN=1//0gXXXXXXXXXXXX...paste-refresh-token-here
```

**Important**: 
- Use the same email address you authorized in step 4
- The refresh token is long (~140 characters)
- Keep it secret - don't commit to version control!

### 7. Restart Your Server

```bash
# Stop the current server (Ctrl+C in terminal)
npm start
```

## Test Email Sending

1. Open Promage Pro at http://localhost:5173
2. Login/Register
3. Go to Users page
4. Click "Invite User"
5. Fill in details and submit
6. Check the terminal - you should see: ✅ **Email sent successfully**
7. Check the recipient's inbox!

## Troubleshooting

### Error: "Invalid grant"
- Your refresh token may have expired
- Go back to OAuth Playground and generate a new one

### Error: "Daily sending quota exceeded"
- Gmail has daily sending limits (500 emails/day for free accounts)
- Wait 24 hours or upgrade to Google Workspace

### Error: "Gmail API not configured"
- Make sure `GMAIL_REFRESH_TOKEN` is set in `.env`
- Restart your server after updating `.env`

### Emails not received
- Check spam/junk folder
- Verify `EMAIL_USER` matches the authorized Google account
- Check server terminal for error messages

## Security Notes

🔒 **Keep these secret**:
- `GOOGLE_CLIENT_SECRET`
- `GMAIL_REFRESH_TOKEN`

✅ **Safe to share**:
- `GOOGLE_CLIENT_ID`
- `EMAIL_USER`

## Alternative: Using Your Own OAuth App

If you want to use your own OAuth credentials instead of the ones in `.env`:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Gmail API
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URI: `https://developers.google.com/oauthplayground`
6. Use your new Client ID and Secret in the OAuth Playground steps above

---

**That's it!** Once configured, Promage Pro will automatically send professional invitation emails to new users with their login credentials.
