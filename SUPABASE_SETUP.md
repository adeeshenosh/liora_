# Supabase Setup Guide

This guide will walk you through setting up Supabase authentication for the Liora application.

## Step 1: Create a Supabase Account and Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" or "Sign in"
3. Create a new account or sign in with GitHub
4. Click "New Project"
5. Fill in your project details:
   - **Name**: Choose a name for your project (e.g., "Liora")
   - **Database Password**: Create a strong password (save this securely)
   - **Region**: Choose the region closest to your users
   - **Pricing Plan**: Start with the free tier
6. Click "Create new project" and wait for it to initialize (takes 1-2 minutes)

## Step 2: Get Your Project Credentials

1. In your Supabase project dashboard, go to **Settings** (gear icon in the left sidebar)
2. Click on **API** in the settings menu
3. You'll see two important values:
   - **Project URL**: This is your `VITE_SUPABASE_URL`
   - **anon/public key**: This is your `VITE_SUPABASE_ANON_KEY`
4. Copy both values

## Step 3: Configure Environment Variables

1. In your project root directory, create a `.env` file (if it doesn't exist)
2. Add the following lines with your actual values:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

**Important**: Replace `your-project-id` and `your-actual-anon-key-here` with the values from Step 2.

## Step 4: Configure Authentication Settings

1. In your Supabase dashboard, go to **Authentication** (left sidebar)
2. Click on **Providers**
3. Ensure **Email** provider is enabled (it should be by default)
4. (Optional) Configure email templates:
   - Go to **Authentication** > **Email Templates**
   - Customize the confirmation email, password reset email, etc.
5. (Optional) Configure password requirements:
   - Go to **Authentication** > **Policies**
   - Set minimum password length and other requirements

## Step 5: Test the Authentication Flow

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to your application
3. Try signing up with a test email
4. Check your email for a confirmation link (if email confirmation is enabled)
5. Try signing in with your credentials

## Optional: Disable Email Confirmation (for Development)

If you want to skip email confirmation during development:

1. Go to **Authentication** > **Providers** in Supabase dashboard
2. Click on **Email** provider
3. Toggle off **"Confirm email"** (or set it to false)
4. Click **Save**

**Note**: For production, you should keep email confirmation enabled for security.

## Troubleshooting

### "Missing Supabase environment variables" error
- Make sure your `.env` file exists in the project root
- Verify the variable names are exactly `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart your development server after adding/changing environment variables

### Authentication not working
- Check that your Supabase project is active (not paused)
- Verify your credentials are correct in the `.env` file
- Check the browser console for error messages
- Ensure the Email provider is enabled in Supabase dashboard

### Email confirmation issues
- Check your spam folder for confirmation emails
- Verify your email provider settings in Supabase
- Consider disabling email confirmation for development/testing

## Next Steps

Once authentication is set up:
- Users can sign up and sign in
- Protected routes (Release Stress, Journaling) will require authentication
- User sessions will persist across page refreshes
- You can access user data via the `useAuth()` hook in your components

For more information, visit the [Supabase Auth Documentation](https://supabase.com/docs/guides/auth).

