# EmailJS Configuration Guide

## Setup Steps

1. **Create EmailJS Account**
   - Go to [emailjs.com](https://www.emailjs.com/)
   - Sign up for a free account (200 emails/month)

2. **Add Email Service**
   - Go to "Email Services" in dashboard
   - Click "Add New Service"
   - Choose your email provider (Gmail recommended)
   - Follow authentication steps
   - Note your **Service ID**

3. **Create Email Template**
   - Go to "Email Templates"
   - Click "Create New Template"
   - Use this template:

```
Subject: {{subject}}

From: {{from_name}}
To: {{to_email}}
Reply-To: {{reply_to}}

{{message_html}}
```

   - Save and note your **Template ID**

4. **Get API Keys**
   - Go to "Account" → "General"
   - Copy your **Public Key**
   - Copy your **Private Key**

5. **Update .env File**

Add these variables to `server/.env`:

```env
# EmailJS Configuration
EMAILJS_SERVICE_ID=service_xxxxxxx
EMAILJS_TEMPLATE_ID=template_xxxxxxx
EMAILJS_PUBLIC_KEY=your_public_key
EMAILJS_PRIVATE_KEY=your_private_key

# App URL
CLIENT_URL=https://fluxo-xi.vercel.app
```

6. **Update Vercel Environment Variables**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add the same EmailJS variables
   - Redeploy the application

## Testing

After configuration, test by:
1. Registering a new user
2. Admin approving the user
3. Checking if approval email is received

## Troubleshooting

- **No emails received**: Check spam folder
- **Invalid credentials**: Verify all 4 EmailJS variables are set correctly
- **Template error**: Make sure template variables match: `{{subject}}`, `{{message_html}}`, etc.
- **Rate limit**: Free tier is 200 emails/month
