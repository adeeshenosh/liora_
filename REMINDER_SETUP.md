# Email Reminder System Setup Guide

This guide explains how to set up the email reminder system for journaling reminders.

## Overview

The email reminder system allows users to receive daily email notifications at their specified time to remind them to journal. The system uses:
- **Supabase Database** - Stores reminder preferences
- **Supabase Edge Functions** - Processes and sends reminders
- **pg_cron** - Schedules reminder checks
- **Supabase SMTP** - Sends emails

## Setup Steps

### 1. Run Database Migration

Run the migration file in your Supabase SQL Editor:

1. Go to **SQL Editor** in Supabase Dashboard
2. Open `supabase/migrations/003_add_reminder_settings.sql`
3. Copy and paste the entire contents
4. Click **Run**

This will:
- Add `reminder_enabled`, `reminder_time`, and `timezone` columns to `user_profiles`
- Create `reminder_logs` table to track sent reminders
- Set up RLS policies

### 2. Configure SMTP in Supabase

1. Go to **Project Settings** > **Auth** > **SMTP Settings**
2. Enable SMTP and configure your provider:
   - **Gmail**: Use App Password (requires 2FA)
   - **SendGrid**: Use API key
   - **Mailgun**: Use SMTP credentials
   - **Other**: Follow provider's SMTP settings
3. Test the SMTP connection
4. Save settings

### 3. Deploy Edge Function

**Option A: Using Supabase CLI**

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy the function
supabase functions deploy send-reminder-emails
```

**Option B: Using Supabase Dashboard**

1. Go to **Edge Functions** in Supabase Dashboard
2. Click **Create a new function**
3. Name it `send-reminder-emails`
4. Copy the contents of `supabase/functions/send-reminder-emails/index.ts`
5. Click **Deploy**

### 4. Configure Edge Function Secrets

1. Go to **Project Settings** > **Edge Functions** > **Secrets**
2. Add the following secrets:
   - `SUPABASE_URL` - Your Supabase project URL (e.g., `https://xxxxx.supabase.co`)
   - `SUPABASE_SERVICE_ROLE_KEY` - Your service role key (from Settings > API)

### 5. Set Up pg_cron Job

Run this SQL in your Supabase SQL Editor (replace placeholders):

```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule job to run every hour
SELECT cron.schedule(
  'send-journal-reminders',
  '0 * * * *', -- Every hour at minute 0
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-reminder-emails',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY'
    ),
    body := '{}'::jsonb
  );
  $$
);
```

**Important**: Replace:
- `YOUR_PROJECT_REF` with your actual Supabase project reference
- `YOUR_SERVICE_ROLE_KEY` with your service role key

### 6. Enable pg_net Extension (if needed)

If `net.http_post` is not available, enable the extension:

```sql
CREATE EXTENSION IF NOT EXISTS pg_net;
```

## How It Works

1. **User enables reminders** in Settings page
2. **Settings sync to database** via `settingsService.syncReminderSettings()`
3. **pg_cron runs every hour** and calls the Edge Function
4. **Edge Function**:
   - Queries users with reminders enabled
   - Checks if reminder already sent today (via `reminder_logs`)
   - Sends email to users whose reminder time matches
   - Logs sent reminders to prevent duplicates
5. **User receives email** at their specified time

## Email Sending Implementation

The current Edge Function logs reminders but doesn't actually send emails. To implement email sending:

### Option A: Use Supabase SMTP (Recommended)

Update the Edge Function to use Supabase's email API (if available) or configure email templates in the dashboard.

### Option B: Use External Email Service

1. Add email service API key as Edge Function secret
2. Update `supabase/functions/send-reminder-emails/index.ts` to call the email service API
3. Example with SendGrid:

```typescript
const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${Deno.env.get('SENDGRID_API_KEY')}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    personalizations: [{
      to: [{ email: user.email }],
    }],
    from: { email: 'noreply@liora.app' },
    subject: emailSubject,
    content: [{
      type: 'text/plain',
      value: emailBody,
    }],
  }),
});
```

### Option C: Use Database Webhooks

1. Set up a webhook that triggers on `reminder_logs` insert
2. Configure webhook to call an external email service
3. This separates email sending from the Edge Function

## Testing

### Test Reminder Settings Sync

1. Go to Settings page
2. Enable "Daily Reminders"
3. Set a reminder time
4. Check database: `SELECT * FROM user_profiles WHERE reminder_enabled = true;`

### Test Edge Function

```bash
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-reminder-emails \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json"
```

### Check Reminder Logs

```sql
SELECT * FROM reminder_logs ORDER BY sent_at DESC LIMIT 10;
```

## Troubleshooting

### Reminders not syncing to database

- Check browser console for errors
- Verify user is authenticated
- Check database connection

### Edge Function not running

- Verify pg_cron extension is enabled
- Check cron job exists: `SELECT * FROM cron.job;`
- Check Edge Function logs in dashboard
- Verify secrets are configured

### Emails not sending

- Verify SMTP is configured correctly
- Check Edge Function logs for errors
- Test SMTP connection in Supabase dashboard
- Verify email service API keys (if using external service)

### Duplicate emails

- Check `reminder_logs` table for duplicate entries
- Verify unique constraint on `(user_id, reminder_date)`
- Check Edge Function logic for duplicate prevention

## Monitoring

### View Active Reminders

```sql
SELECT id, email, reminder_time, timezone 
FROM user_profiles 
WHERE reminder_enabled = true;
```

### View Reminder History

```sql
SELECT 
  rl.*,
  up.email,
  up.name
FROM reminder_logs rl
JOIN user_profiles up ON rl.user_id = up.id
ORDER BY rl.sent_at DESC
LIMIT 50;
```

### Check Cron Job Status

```sql
SELECT * FROM cron.job WHERE jobname = 'send-journal-reminders';
```

## Security Notes

- Service role key should NEVER be exposed to client-side code
- Edge Function secrets are secure and only accessible server-side
- RLS policies ensure users can only view their own reminder logs
- Email addresses are protected by RLS on `user_profiles` table

## Next Steps

1. Implement actual email sending in Edge Function
2. Add email templates for better formatting
3. Add timezone conversion for accurate reminder timing
4. Add retry logic for failed email sends
5. Create admin dashboard to monitor reminder delivery

