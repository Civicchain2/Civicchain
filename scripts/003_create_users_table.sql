-- Create users table to store user profiles
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('citizen', 'officer', 'auditor')),
  nin TEXT,
  nin_verified BOOLEAN DEFAULT FALSE,
  cardano_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS users_email_idx ON public.users(email);

-- Create index for role lookups
CREATE INDEX IF NOT EXISTS users_role_idx ON public.users(role);
