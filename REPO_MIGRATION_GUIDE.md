# CivicChain Repository Migration & Production Setup Guide

This guide walks you through cloning the CivicChain repository, pushing it to a new repository, and configuring everything for production deployment.

## Prerequisites

- Git installed on your machine
- Node.js 18+ or Bun installed
- A GitHub/GitLab/Bitbucket account
- A Vercel account (or other hosting platform)
- A Prisma Accelerate account (free tier available)

---

## Step 1: Clone the Current Repository

```bash
# Clone the repository
git clone https://github.com/your-username/civicchain-original.git

# Navigate into the project
cd civicchain-original

# Remove the original git remote
git remote remove origin
```

---

## Step 2: Create a New Repository

1. Go to GitHub (or your preferred Git provider)
2. Create a new repository (e.g., `civicchain-production`)
3. **Do NOT initialize with README, .gitignore, or license** (we already have these)
4. Copy the repository URL

---

## Step 3: Push to Your New Repository

```bash
# Add your new repository as the remote
git remote add origin https://github.com/your-username/civicchain-production.git

# Verify the remote
git remote -v

# Push all branches and tags
git push -u origin main
git push --tags
```

---

## Step 4: Set Up Prisma Accelerate Database

### 4.1 Create Prisma Accelerate Project

1. Go to [Prisma Data Platform](https://cloud.prisma.io/)
2. Sign up / Log in
3. Click **"New Project"**
4. Choose **"Enable Accelerate"**
5. Select your database provider:
   - **PostgreSQL** (recommended)
   - You can use:
     - Neon (free tier)
     - Supabase (free tier)
     - Railway (free tier)
     - Your own PostgreSQL instance

### 4.2 Get Your Database URL

If you don't have a PostgreSQL database yet:

**Option A: Neon (Recommended)**
1. Go to [neon.tech](https://neon.tech)
2. Sign up and create a new project
3. Copy the connection string (looks like: `postgresql://username:password@host/database`)

**Option B: Supabase**
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string under "Connection string" → "URI"

### 4.3 Configure Accelerate

1. In Prisma Data Platform, paste your database connection string
2. Click **"Enable Accelerate"**
3. Copy the **Accelerate connection string** (starts with `prisma+postgres://`)
4. Save this - you'll need it for environment variables

---

## Step 5: Configure Environment Variables

### 5.1 Create Local `.env` File

In your project root, create `.env`:

```env
# Database (Prisma Accelerate URL)
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=YOUR_API_KEY_HERE"

# Application URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Identus Cloud Agent (Optional - for DID features)
IDENTUS_CLOUD_URL="http://localhost:8080"
IDENTUS_API_KEY=""

# Identus Mediator (Optional - for DID wallet linking)
NEXT_PUBLIC_MEDIATOR_DID="did:peer:2.Ez6LSghwSE437wnDE1pt3X6hVDUQzSjsHzinpX3XFvMjRAm7y.Vz6Mkhh1e5CEYYq6JBUcTZ6Cp2ranCWRrv7Yax3Le4N59R6dd.SeyJ0IjoiZG0iLCJzIjp7InVyaSI6Imh0dHBzOi8vbWVkaWF0b3Iucm9vdHNpZC5jbG91ZCIsImEiOlsiZGlkY29tbS92MiJdfX0"
IDENTUS_MEDIATOR_DID="did:peer:2.Ez6LSghwSE437wnDE1pt3X6hVDUQzSjsHzinpX3XFvMjRAm7y.Vz6Mkhh1e5CEYYq6JBUcTZ6Cp2ranCWRrv7Yax3Le4N59R6dd.SeyJ0IjoiZG0iLCJzIjp7InVyaSI6Imh0dHBzOi8vbWVkaWF0b3Iucm9vdHNpZC5jbG91ZCIsImEiOlsiZGlkY29tbS92MiJdfX0"

# Cardano Blockfrost (Optional - for blockchain features)
NEXT_PUBLIC_BLOCKFROST_PROJECT_ID=""
```

**Important:** Replace `YOUR_API_KEY_HERE` with your actual Prisma Accelerate connection string!

### 5.2 Add to Vercel (Production)

1. Go to [vercel.com](https://vercel.com)
2. Import your new repository
3. Before deploying, go to **Settings → Environment Variables**
4. Add each environment variable:
   - `DATABASE_URL` → Your Prisma Accelerate connection string
   - `NEXT_PUBLIC_APP_URL` → Your production URL (e.g., `https://civicchain.vercel.app`)
   - Add other optional variables as needed
5. Set environment to: **Production, Preview, and Development**

---

## Step 6: Initialize the Database Schema

### 6.1 Install Dependencies

```bash
# If using npm
npm install

# If using bun (recommended)
bun install
```

### 6.2 Push Database Schema

This creates all the tables in your database:

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database (creates tables)
npx prisma db push

# Verify tables were created
npx prisma studio
```

**Important:** The `prisma db push` command will create tables in your **production database** (via Prisma Accelerate), so make sure your DATABASE_URL is correct!

---

## Step 7: Test Locally

```bash
# Start development server
npm run dev
# or
bun dev

# Visit http://localhost:3000
```

### Test Registration
1. Go to `/register`
2. Fill in the registration form
3. Submit
4. If successful, you should see a success message
5. Check Prisma Studio to verify the user was created

### Common Issues

**"Database not configured"**
- Your DATABASE_URL is not set or incorrect
- Check `.env` file exists and has the correct URL

**"Database error"**
- Tables don't exist yet
- Run `npx prisma db push` to create tables
- Verify connection with `npx prisma studio`

**"Cannot find module @prisma/client"**
- Prisma client not generated
- Run `npx prisma generate`

---

## Step 8: Deploy to Production

### 8.1 Commit and Push Changes

```bash
# If you made any changes
git add .
git commit -m "Configure for production"
git push origin main
```

### 8.2 Deploy on Vercel

1. Vercel will automatically detect the push and start deploying
2. Wait for build to complete
3. Visit your production URL
4. Test registration and login

### 8.3 Verify Production Database

After first deployment, verify your database has the schema:

```bash
# Connect to your production database using the Accelerate URL
npx prisma studio
```

You should see all the tables: `User`, `Verification`, `Transaction`, `Did`, `DidConnection`, `CredentialRecord`, `UserDid`, `Session`

---

## Step 9: Configure Optional Features

### 9.1 Identus Cloud Agent (For DID Features)

If you want to enable decentralized identity features:

1. Follow the [IDENTUS_CLOUD_SETUP.md](./IDENTUS_CLOUD_SETUP.md) guide
2. Deploy Identus Cloud Agent to Railway or your server
3. Add `IDENTUS_CLOUD_URL` and `IDENTUS_API_KEY` to Vercel environment variables
4. Redeploy

### 9.2 Cardano Blockchain (For Payment Features)

If you want to enable blockchain payments:

1. Sign up at [Blockfrost.io](https://blockfrost.io)
2. Create a project (choose mainnet or testnet)
3. Copy your Project ID
4. Add `NEXT_PUBLIC_BLOCKFROST_PROJECT_ID` to Vercel
5. Redeploy

---

## Step 10: Post-Deployment Checklist

- [ ] Database URL configured in Vercel
- [ ] Database schema pushed successfully
- [ ] Can register a new user in production
- [ ] Can login with registered user
- [ ] Environment variables are correct
- [ ] All features you need are working
- [ ] Custom domain configured (optional)
- [ ] SSL certificate is active
- [ ] Monitor Vercel logs for any errors

---

## Troubleshooting

### Build Fails on Vercel

**Error: Prisma client not generated**
```bash
# Ensure package.json has the correct build script:
"build": "prisma generate && next build"
```

**Error: Module not found**
- Check that all dependencies are in `package.json`
- Try deleting `node_modules` and reinstalling

### Database Connection Issues

**Error: P1001 - Can't reach database**
- Check DATABASE_URL is correct
- Verify Prisma Accelerate API key is valid
- Check database is online (test with Prisma Studio)

**Error: P2021 - Table does not exist**
- Run `npx prisma db push` to create tables
- Verify schema.prisma matches your database

### Application Errors

**"Database not configured"**
- DATABASE_URL environment variable is missing
- Add it in Vercel Settings → Environment Variables

**"Database error"**
- Tables not created yet
- Run `npx prisma db push`
- Check Vercel logs for specific error

---

## Monitoring & Maintenance

### View Logs
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# View production logs
vercel logs
```

### Database Backups

Prisma Accelerate doesn't include backups. Set up backups for your underlying database:

**Neon:** Backups included in paid plans
**Supabase:** Automatic daily backups
**Railway:** Configure PostgreSQL backups

### Update Dependencies

```bash
# Check for updates
npm outdated

# Update safely
npm update

# Test locally before deploying
npm run build
npm run dev
```

---

## Production Best Practices

1. **Environment Variables**
   - Never commit `.env` to git
   - Keep production secrets secure
   - Rotate API keys periodically

2. **Database**
   - Monitor connection usage
   - Set up alerts for errors
   - Regular backups

3. **Performance**
   - Monitor Vercel analytics
   - Use Prisma Accelerate's caching
   - Enable CDN for static assets

4. **Security**
   - Keep dependencies updated
   - Use strong passwords
   - Enable rate limiting if needed

5. **Monitoring**
   - Set up error tracking (Sentry)
   - Monitor uptime
   - Track user registrations

---

## Quick Reference

### Useful Commands

```bash
# Install dependencies
bun install

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Open database viewer
npx prisma studio

# Run locally
bun dev

# Build for production
bun run build

# View Vercel logs
vercel logs

# Deploy manually
vercel --prod
```

### Important URLs

- **Prisma Cloud:** https://cloud.prisma.io
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Neon Database:** https://console.neon.tech
- **Blockfrost API:** https://blockfrost.io

---

## Support

If you encounter issues:

1. Check this guide's Troubleshooting section
2. Review [DATABASE_SETUP.md](./DATABASE_SETUP.md)
3. Check [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)
4. Review Vercel deployment logs
5. Check Prisma Studio for database state

---

## Next Steps

Once deployed successfully:

1. **Test all features** - Registration, login, verification flow
2. **Set up monitoring** - Error tracking, uptime monitoring
3. **Configure backups** - Database backup strategy
4. **Custom domain** - Add your domain in Vercel
5. **Enable DID features** - Set up Identus Cloud Agent if needed
6. **Add analytics** - Track user behavior
7. **Security hardening** - Rate limiting, CORS configuration

Congratulations! Your CivicChain platform is now live in production! 🚀
