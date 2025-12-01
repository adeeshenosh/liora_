# Database Setup Guide

This guide explains how to set up the Supabase database schema for the Liora application.

## Important: Disable Email Confirmation for MVP

**Before running the migration, disable email confirmation in Supabase:**

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** > **Providers** > **Email**
3. Find **"Confirm email"** setting
4. **Disable** email confirmation (toggle it off)
5. This allows users to sign up and immediately access features without email verification

**Why?** Email confirmation requires SMTP configuration. For MVP/testing, disabling it allows immediate access after signup. You can enable it later when SMTP is properly configured.

## Overview

The database schema includes three main tables:
1. **user_profiles** - Extended user information
2. **conversations** - Conversation sessions between users and Liora
3. **messages** - Individual messages with emotional state tracking

## Prerequisites

- A Supabase project created at [supabase.com](https://supabase.com)
- Access to your Supabase project dashboard
- SQL Editor access in Supabase Dashboard

## Step 1: Create Storage Bucket for Avatars

Before running migrations, create a storage bucket for profile pictures:

1. **Go to Storage in Supabase Dashboard**
   - Click on "Storage" in the left sidebar
   - Click "Create bucket"

2. **Configure the bucket:**
   - **Name**: `avatars`
   - **Public bucket**: YES (checked) - This allows public access to profile pictures
   - **File size limit**: 5MB (recommended)
   - **Allowed MIME types**: `image/*` (or leave empty for all image types)
   - Click "Create bucket"

3. **Set up Storage Policies** (Optional - handled by migration)
   - The migration will create RLS policies for the storage bucket
   - Users can only upload/delete their own avatars
   - All avatars are publicly viewable

## Step 2: Run the Migrations

### Option A: Using Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   - Go to [app.supabase.com](https://app.supabase.com)
   - Select your project

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Copy and Paste First Migration**
   - Open the file: `supabase/migrations/001_initial_schema.sql`
   - Copy the entire contents
   - Paste into the SQL Editor

4. **Run the First Migration**
   - Click "Run" or press `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)
   - Wait for the migration to complete
   - You should see "Success. No rows returned" if everything worked

5. **Copy and Paste Second Migration (Avatar Support)**
   - Open the file: `supabase/migrations/002_add_avatar_storage.sql`
   - Copy the entire contents
   - Paste into the SQL Editor

6. **Run the Second Migration**
   - Click "Run" or press `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)
   - Wait for the migration to complete
   - **Important**: This migration creates the storage RLS policies needed for avatar uploads
   - If you see errors about policies already existing, that's okay - the migration will drop and recreate them

### Option B: Using Supabase CLI

If you have Supabase CLI installed:

```bash
# Link your project (if not already linked)
supabase link --project-ref your-project-ref

# Run the migration
supabase db push
```

## Step 2: Verify Tables Were Created

1. **Check Table Editor**
   - Go to "Table Editor" in Supabase Dashboard
   - You should see three new tables:
     - `user_profiles`
     - `conversations`
     - `messages`

2. **Verify RLS is Enabled**
   - Click on each table
   - Check that "Row Level Security" shows as "Enabled"
   - If not, the migration may have failed - check the SQL Editor for errors

## Step 3: Verify Triggers

1. **Check Database Functions**
   - Go to "Database" > "Functions" in Supabase Dashboard
   - You should see:
     - `handle_new_user()` - Creates profile on signup
     - `update_updated_at_column()` - Updates timestamps

2. **Check Triggers**
   - Go to "Database" > "Triggers" in Supabase Dashboard
   - You should see:
     - `on_auth_user_created` - Fires when user signs up
     - `update_user_profiles_updated_at` - Updates profile timestamps
     - `update_conversations_updated_at` - Updates conversation timestamps

## Step 4: Test the Setup

### Test User Profile Creation

1. **Sign up a new user** in your application
2. **Check Supabase Dashboard**
   - Go to "Table Editor" > "user_profiles"
   - You should see a new row with the user's information
   - The profile should be created automatically by the trigger

### Test Conversation Storage

1. **Sign in** to your application
2. **Start a conversation** with Liora (use the voice input)
3. **Check Supabase Dashboard**
   - Go to "Table Editor" > "conversations"
   - You should see a new conversation row
   - Go to "Table Editor" > "messages"
   - You should see message rows with:
     - User messages with emotional state
     - Liora's responses

## Database Schema Details

### user_profiles Table

Stores extended user information beyond Supabase Auth.

**Columns:**
- `id` (UUID) - Primary key, references `auth.users(id)`
- `email` (TEXT) - User's email address
- `name` (TEXT) - User's display name (optional)
- `avatar_url` (TEXT) - URL to user's profile picture (optional)
- `created_at` (TIMESTAMPTZ) - When profile was created
- `updated_at` (TIMESTAMPTZ) - When profile was last updated
- `last_active_at` (TIMESTAMPTZ) - When user was last active

**RLS Policies:**
- Users can only view, insert, and update their own profile

### conversations Table

Represents a conversation session between a user and Liora.

**Columns:**
- `id` (UUID) - Primary key
- `user_id` (UUID) - References `auth.users(id)`
- `session_id` (TEXT) - Unique session identifier
- `created_at` (TIMESTAMPTZ) - When conversation started
- `updated_at` (TIMESTAMPTZ) - When conversation was last updated

**RLS Policies:**
- Users can only view, create, update, and delete their own conversations

### messages Table

Stores individual messages in conversations with emotional state tracking.

**Columns:**
- `id` (UUID) - Primary key
- `conversation_id` (UUID) - References `conversations(id)`
- `user_id` (UUID) - References `auth.users(id)`
- `role` (TEXT) - Either 'user' or 'assistant' (Liora)
- `content` (TEXT) - The message content
- `emotional_state` (TEXT) - Detected emotional state: 'angry', 'sad', 'anxious', 'overwhelmed', 'happy', or 'neutral'
- `confidence` (NUMERIC) - Confidence score (0-1) of emotion detection
- `created_at` (TIMESTAMPTZ) - When message was created

**RLS Policies:**
- Users can only view, create, update, and delete messages in their own conversations

## Row Level Security (RLS)

All tables have RLS enabled to ensure users can only access their own data. The policies are:

1. **user_profiles**: Users can only access their own profile
2. **conversations**: Users can only access conversations where `user_id` matches their auth ID
3. **messages**: Users can only access messages in conversations they own

## Automatic Profile Creation

When a user signs up, the `on_auth_user_created` trigger automatically creates a profile in the `user_profiles` table. This happens server-side in Supabase, so it's secure and reliable.

## Troubleshooting

### Migration Fails

**Error: "relation already exists"**
- The tables may already exist from a previous migration
- Drop the existing tables and re-run the migration, OR
- Modify the migration to use `CREATE TABLE IF NOT EXISTS`

**Error: "permission denied"**
- Make sure you're running the migration as the database owner
- Check that you have the correct permissions in Supabase

### Profile Not Created on Signup

**Check the trigger:**
1. Go to "Database" > "Triggers" in Supabase Dashboard
2. Verify `on_auth_user_created` exists and is enabled
3. Check the function `handle_new_user()` exists

**Manual fix:**
- The `authService.signUp()` function also creates profiles as a fallback
- Check browser console for any errors

### RLS Blocking Queries

**Symptoms:**
- Queries return empty results even though data exists
- Errors about "permission denied"

**Solution:**
1. Verify RLS is enabled on all tables
2. Check that policies are correctly set up
3. Ensure user is authenticated (check `auth.uid()` is not null)
4. Test policies in Supabase Dashboard using "Run as user" feature

### Messages Not Saving

**Check:**
1. User is authenticated (`isAuthenticated` is true)
2. Conversation was created successfully
3. Check browser console for database errors
4. Verify RLS policies allow INSERT on messages table

## Testing Checklist

After setup, verify:

- [ ] Storage bucket "avatars" is created and public
- [ ] All three tables exist in Table Editor
- [ ] `avatar_url` column exists in `user_profiles` table
- [ ] RLS is enabled on all tables
- [ ] Storage RLS policies are created
- [ ] Triggers are created and enabled
- [ ] Functions are created
- [ ] User profile is created automatically on signup
- [ ] Profile picture can be uploaded
- [ ] Profile picture displays correctly
- [ ] Conversations are saved when user talks to Liora
- [ ] Messages are saved with emotional state
- [ ] Users can only see their own data
- [ ] Unauthenticated users cannot access data

## Next Steps

1. **Generate TypeScript Types** (Optional but Recommended)
   - Use Supabase CLI: `supabase gen types typescript --linked > src/lib/database.types.ts`
   - OR copy from Supabase Dashboard: Settings > API > TypeScript types

2. **Test Authentication Flow**
   - Sign up a new user
   - Verify profile is created
   - Sign in and verify `last_active_at` updates

3. **Test Conversation Storage**
   - Start a conversation with Liora
   - Verify conversation and messages are saved
   - Check emotional state is stored correctly

## Security Notes

- **Never expose service_role key** in client-side code
- **Always use anon key** in the frontend
- **RLS policies** ensure users can only access their own data
- **Triggers** run with `SECURITY DEFINER` to bypass RLS when needed (for profile creation)

## Support

If you encounter issues:
1. Check the SQL Editor for error messages
2. Review the migration file for syntax errors
3. Verify your Supabase project is active
4. Check Supabase status page for service issues

