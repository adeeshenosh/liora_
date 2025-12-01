# Row Level Security (RLS) Policies Guide

## What is Row Level Security?

Row Level Security (RLS) is a PostgreSQL feature that allows you to restrict access to individual rows in a table based on policies. In Supabase, RLS is essential for securing your data and ensuring users can only access data they're authorized to see.

**Key Concept**: Without RLS enabled, anyone with your database connection string can access all data. With RLS, even if someone gets your connection string, they can only access data according to your policies.

## How RLS Works

1. **Enable RLS**: RLS must be enabled on each table you want to protect
2. **Create Policies**: Define policies that determine who can access which rows
3. **Policy Evaluation**: PostgreSQL evaluates policies on every query
4. **User Context**: Policies use the authenticated user's ID (from `auth.uid()`) to make decisions

## Security Best Practices

### 1. Always Enable RLS on User Data Tables

```sql
-- Enable RLS on a table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

### 2. Use the `anon` Key in Client-Side Code

- ✅ **Use**: `VITE_SUPABASE_ANON_KEY` in your frontend
- ❌ **Never Use**: `SUPABASE_SERVICE_ROLE_KEY` in frontend code
- The `anon` key respects RLS policies
- The `service_role` key bypasses RLS (server-side only)

### 3. Principle of Least Privilege

Create policies that grant the minimum necessary access:
- Users should only see their own data by default
- Use specific policies for shared data
- Deny by default, allow explicitly

### 4. Test Your Policies

Always test policies from both authenticated and unauthenticated contexts to ensure they work as expected.

## Common Policy Patterns

### Pattern 1: Users Can Only Access Their Own Data

```sql
-- Example: User profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can SELECT their own profile
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can UPDATE their own profile
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Policy: Users can INSERT their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);
```

### Pattern 2: Public Read, Authenticated Write

```sql
-- Example: Public blog posts
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  author_id UUID REFERENCES auth.users(id),
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read published posts
CREATE POLICY "Anyone can view published posts"
  ON posts
  FOR SELECT
  USING (published = true);

-- Policy: Authenticated users can create posts
CREATE POLICY "Authenticated users can create posts"
  ON posts
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Policy: Authors can update their own posts
CREATE POLICY "Authors can update own posts"
  ON posts
  FOR UPDATE
  USING (auth.uid() = author_id);

-- Policy: Authors can delete their own posts
CREATE POLICY "Authors can delete own posts"
  ON posts
  FOR DELETE
  USING (auth.uid() = author_id);
```

### Pattern 3: Team/Organization-Based Access

```sql
-- Example: Team members can access team data
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE team_members (
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  PRIMARY KEY (team_id, user_id)
);

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view teams they're members of
CREATE POLICY "Users can view their teams"
  ON teams
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = teams.id
      AND team_members.user_id = auth.uid()
    )
  );

-- Policy: Users can view their team memberships
CREATE POLICY "Users can view own memberships"
  ON team_members
  FOR SELECT
  USING (user_id = auth.uid());
```

### Pattern 4: Admin-Only Access

```sql
-- Example: Admin-only settings table
CREATE TABLE app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can access settings
CREATE POLICY "Admins can manage settings"
  ON app_settings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
```

## Policy Functions Reference

### `auth.uid()`
Returns the UUID of the currently authenticated user, or `NULL` if not authenticated.

```sql
-- Example: Check if user owns a resource
USING (auth.uid() = user_id)
```

### `auth.role()`
Returns the role of the current user: `'authenticated'`, `'anon'`, or `'service_role'`.

```sql
-- Example: Allow all authenticated users
USING (auth.role() = 'authenticated')
```

### `auth.jwt()`
Returns the entire JWT payload as JSONB. Useful for accessing custom claims.

```sql
-- Example: Check custom claim
USING ((auth.jwt() ->> 'user_role')::text = 'admin')
```

## Testing RLS Policies

### 1. Test from Supabase Dashboard

1. Go to **Table Editor** in your Supabase dashboard
2. Try to query data as different users
3. Verify policies work as expected

### 2. Test from Your Application

```typescript
// Test as authenticated user
const { data, error } = await supabase
  .from('profiles')
  .select('*');

// Test as unauthenticated user
await supabase.auth.signOut();
const { data: publicData, error: publicError } = await supabase
  .from('profiles')
  .select('*');
```

### 3. Common Testing Scenarios

- ✅ Authenticated user can access their own data
- ✅ Authenticated user cannot access other users' data
- ✅ Unauthenticated user cannot access protected data
- ✅ Users can create their own records
- ✅ Users can update their own records
- ✅ Users cannot update other users' records
- ✅ Users can delete their own records
- ✅ Users cannot delete other users' records

## Example: Complete Setup for User Journal Entries

```sql
-- Create journal entries table
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  mood TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own entries
CREATE POLICY "Users can view own entries"
  ON journal_entries
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can create their own entries
CREATE POLICY "Users can create own entries"
  ON journal_entries
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own entries
CREATE POLICY "Users can update own entries"
  ON journal_entries
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own entries
CREATE POLICY "Users can delete own entries"
  ON journal_entries
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX journal_entries_user_id_idx ON journal_entries(user_id);
CREATE INDEX journal_entries_created_at_idx ON journal_entries(created_at DESC);
```

## Security Checklist

- [ ] RLS enabled on all user data tables
- [ ] Policies tested for authenticated users
- [ ] Policies tested for unauthenticated users
- [ ] No `service_role` key in client-side code
- [ ] Policies follow principle of least privilege
- [ ] Indexes created for performance
- [ ] Foreign key constraints properly set up
- [ ] Policies handle edge cases (NULL values, deleted users, etc.)

## Common Mistakes to Avoid

### ❌ Mistake 1: Forgetting to Enable RLS

```sql
-- BAD: Table without RLS
CREATE TABLE sensitive_data (...);
-- Anyone with connection string can access all data!
```

```sql
-- GOOD: Enable RLS
ALTER TABLE sensitive_data ENABLE ROW LEVEL SECURITY;
```

### ❌ Mistake 2: Using Service Role Key in Frontend

```typescript
// BAD: Never do this!
const supabase = createClient(url, SERVICE_ROLE_KEY);
// This bypasses all RLS policies!
```

```typescript
// GOOD: Use anon key
const supabase = createClient(url, ANON_KEY);
// This respects RLS policies
```

### ❌ Mistake 3: Overly Permissive Policies

```sql
-- BAD: Too permissive
CREATE POLICY "Everyone can do everything"
  ON profiles
  FOR ALL
  USING (true);
```

```sql
-- GOOD: Specific and restrictive
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);
```

## Additional Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/security)

## Need Help?

If you're unsure about your RLS policies:

1. Test them thoroughly in the Supabase dashboard
2. Review the policy logic step by step
3. Check Supabase logs for policy evaluation errors
4. Start with restrictive policies and gradually open them up as needed

Remember: **It's better to be too restrictive than too permissive when it comes to security.**

