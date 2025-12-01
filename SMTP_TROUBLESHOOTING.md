# SMTP Configuration Troubleshooting Guide

## Common SMTP Errors and Solutions

### Error: "Server error. Please try again later."

This error typically occurs when:
1. SMTP is enabled but not properly configured
2. SMTP credentials are incorrect
3. Email service is temporarily unavailable

### Error: "Email service configuration error"

This indicates an issue with your SMTP settings in Supabase.

## How to Fix SMTP Configuration Issues

### Step 1: Check SMTP Settings in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **Auth** → **SMTP Settings**
3. Verify the following:
   - SMTP is enabled
   - SMTP host is correct
   - SMTP port is correct (usually 587 for TLS or 465 for SSL)
   - SMTP username/email is correct
   - SMTP password is correct
   - Sender email matches your SMTP account

### Step 2: Test SMTP Connection

1. In Supabase dashboard, go to **Settings** → **Auth** → **SMTP Settings**
2. Click "Test SMTP Connection"
3. Check if the test email is received
4. If test fails, verify your SMTP credentials

### Step 3: Common SMTP Providers Configuration

#### Gmail SMTP Settings
```
Host: smtp.gmail.com
Port: 587 (TLS) or 465 (SSL)
Username: your-email@gmail.com
Password: App Password (not your regular password)
```

**Important for Gmail:**
- You need to generate an "App Password" in your Google Account settings
- Enable 2-factor authentication first
- Use the app password, not your regular Gmail password

#### Outlook/Hotmail SMTP Settings
```
Host: smtp-mail.outlook.com
Port: 587
Username: your-email@outlook.com
Password: your password
```

#### SendGrid SMTP Settings
```
Host: smtp.sendgrid.net
Port: 587
Username: apikey
Password: your SendGrid API key
```

#### Mailgun SMTP Settings
```
Host: smtp.mailgun.org
Port: 587
Username: your Mailgun SMTP username
Password: your Mailgun SMTP password
```

### Step 4: Check Email Confirmation Settings

1. Go to **Authentication** → **Providers** → **Email**
2. Check if "Confirm email" is enabled
3. If enabled, users must confirm their email before accessing the app
4. If disabled, users are logged in immediately after signup

### Step 5: Verify Email Templates

1. Go to **Authentication** → **Email Templates**
2. Check that confirmation email template is configured
3. Verify the redirect URL in the template matches your app URL

## Temporary Workaround: Disable Email Confirmation

If you're having SMTP issues and need to test the app:

1. Go to **Authentication** → **Providers** → **Email**
2. Toggle off **"Confirm email"**
3. Click **Save**
4. Users will now be logged in immediately after signup (no email required)

**⚠️ Warning:** Only disable email confirmation for development/testing. Always enable it for production.

## Debugging Steps

### 1. Check Browser Console

Open browser developer tools (F12) and check the Console tab for detailed error messages.

### 2. Check Supabase Logs

1. Go to **Logs** in your Supabase dashboard
2. Look for authentication-related errors
3. Check for SMTP/email sending errors

### 3. Test with Different Email Provider

Try configuring a different SMTP provider to isolate the issue:
- If Gmail doesn't work, try SendGrid or Mailgun
- This helps determine if it's a provider-specific issue

### 4. Verify Network/Firewall

Some networks block SMTP ports. Ensure:
- Port 587 (TLS) or 465 (SSL) is not blocked
- Your firewall allows outbound SMTP connections

## Common Error Messages and Solutions

### "SMTP configuration error"
- **Solution:** Check your SMTP credentials in Supabase dashboard
- Verify host, port, username, and password are correct

### "Failed to send confirmation email"
- **Solution:** 
  1. Test SMTP connection in Supabase
  2. Check spam folder
  3. Verify sender email is correct
  4. Try a different SMTP provider

### "Server error. Please try again later."
- **Solution:**
  1. Check Supabase project status (not paused)
  2. Verify SMTP settings are correct
  3. Check Supabase logs for detailed error
  4. Try disabling email confirmation temporarily

## Best Practices

1. **Use a dedicated email service** (SendGrid, Mailgun, AWS SES) for production
2. **Never use personal Gmail** for production apps
3. **Always enable email confirmation** in production
4. **Test SMTP connection** before going live
5. **Monitor email delivery** rates
6. **Set up email templates** that match your brand

## Getting Help

If you're still experiencing issues:

1. Check the [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
2. Review [Supabase SMTP Guide](https://supabase.com/docs/guides/auth/auth-smtp)
3. Check Supabase community forums
4. Contact Supabase support with:
   - Your project ID
   - Error messages from logs
   - SMTP provider you're using (without credentials)

## Quick Checklist

- [ ] SMTP is enabled in Supabase
- [ ] SMTP credentials are correct
- [ ] Test SMTP connection succeeds
- [ ] Email confirmation setting matches your needs
- [ ] Email templates are configured
- [ ] Redirect URLs in templates are correct
- [ ] No firewall blocking SMTP ports
- [ ] Using appropriate SMTP provider for your use case

