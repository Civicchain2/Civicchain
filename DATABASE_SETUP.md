# Database Setup Guide

## Problem: "Database error" on Registration

If you're seeing "Database error" when trying to register users, it means the database schema hasn't been created yet.

## Solution

The database tables need to be created in your PostgreSQL database. Here's how:

### Option 1: Using Prisma CLI (Recommended)

1. Install dependencies locally:
   ```bash
   bun install
   ```

2. Push the schema to your database:
   ```bash
   npx prisma db push
   ```

   This will create all the tables defined in `prisma/schema.prisma` in your database.

### Option 2: Using Prisma Migrate

For production environments, use migrations:

```bash
npx prisma migrate deploy
```

### Option 3: Check Database Initialization Status

Visit this endpoint to check if your database is properly initialized:

```
https://your-app.vercel.app/api/db-init
```

This will tell you:
- If the DATABASE_URL is configured
- If the database connection works
- If the tables exist

## For Vercel Deployment

After adding the DATABASE_URL to Vercel environment variables:

1. **Option A: Use Vercel CLI locally**
   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Link to your project
   vercel link

   # Pull environment variables
   vercel env pull

   # Push database schema
   npx prisma db push
   ```

2. **Option B: Run in Vercel Function**
   
   You can create a one-time setup function or run it from your local machine connected to the production database.

## Prisma Accelerate Notes

Since you're using Prisma Accelerate (connection string starts with `prisma+postgres://`):

- The `prisma db push` command works with Accelerate
- Migrations work normally
- The schema is applied to your actual PostgreSQL database, not Accelerate itself

## Verifying Setup

After running `prisma db push`, you should see:

```
🚀  Your database is now in sync with your Prisma schema.

✔ Generated Prisma Client (v6.19.1) to ./node_modules/@prisma/client
```

Then try registering again - it should work!

## Common Issues

### Error: "Environment variable not found: DATABASE_URL"

Solution: Make sure DATABASE_URL is in your .env file locally, or set in Vercel environment variables for production.

### Error: "Can't reach database server"

Solution: 
- Check if your DATABASE_URL is correct
- Verify your database is running and accessible
- Check firewall rules if using a hosted database

### Error: "The table `User` does not exist"

Solution: Run `npx prisma db push` to create the tables.
