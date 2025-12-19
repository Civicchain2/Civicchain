# CivicChain Deployment Checklist

## Pre-Deployment Requirements

### 1. Database Setup (Critical)

Your Prisma Accelerate database needs to have the schema pushed before the app can work.

**Required Steps:**

```bash
# Install dependencies locally
npm install

# Push the database schema to create tables
npx prisma db push

# Verify the schema was created
npx prisma studio
```

**What this does:**
- Creates all required tables (User, UserSession, Verification, Did, DidConnection, CredentialRecord, UserDid)
- Sets up indexes and relationships
- Makes the database ready to accept data

### 2. Vercel Environment Variables

Go to your Vercel project → Settings → Environment Variables and add:

**Required:**
- `DATABASE_URL` - Your Prisma Accelerate connection string
  ```
  prisma+postgres://accelerate.prisma-data.net/?api_key=YOUR_API_KEY&sslmode=require
  ```

**Optional (for DID/Blockchain features):**
- `NEXT_PUBLIC_BLOCKFROST_PROJECT_ID` - From blockfrost.io (for Cardano)
- `IDENTUS_CLOUD_URL` - Your Identus Cloud Agent URL (default: http://localhost:8080)
- `IDENTUS_API_KEY` - If your Identus agent requires authentication
- `NEXT_PUBLIC_MEDIATOR_DID` - DIDComm mediator (default: did:peer:...)
- `NEXT_PUBLIC_APP_URL` - Your production URL (e.g., https://civicchain.vercel.app)

**Important:** After adding environment variables, you MUST redeploy the application.

### 3. Verify Database Connection

After deployment, visit these endpoints to verify setup:

1. **Database Status Check:**
   ```
   https://your-app.vercel.app/api/db-status
   ```
   Should return: `{ "canConnect": true, "tablesExist": true }`

2. **Health Check:**
   ```
   https://your-app.vercel.app/api/health
   ```

## Common Deployment Issues

### Issue: "Database not configured"
**Solution:** DATABASE_URL is not set in Vercel environment variables
- Go to Vercel Dashboard → Settings → Environment Variables
- Add DATABASE_URL with your Prisma Accelerate connection string
- Redeploy

### Issue: "Database error" or "Database schema not initialized"
**Solution:** Database tables don't exist yet
```bash
# Run this locally (it will affect your production database via Accelerate)
npx prisma db push
```

### Issue: "Cannot connect to database"
**Solution:** DATABASE_URL is incorrect or database is unreachable
- Verify the connection string is correct
- Check Prisma Accelerate dashboard for database status
- Ensure API key is valid

### Issue: Registration works but shows generic errors
**Solution:** Check Vercel function logs
- Go to Vercel Dashboard → Deployments → Click latest deployment
- Click "Functions" tab to see server-side errors
- Look for detailed error messages from Prisma

## Post-Deployment Verification

1. Visit `/register` and create a test account
2. Visit `/login` and verify you can log in
3. Check that the dashboard loads correctly
4. Visit `/api/db-status` to verify database health

## Architecture Notes

### Database
- Using Prisma ORM with PostgreSQL via Prisma Accelerate
- Schema managed in `prisma/schema.prisma`
- Connection pooling and edge caching via Accelerate

### Authentication
- Custom bcrypt-based authentication (no Supabase/Auth0)
- Session management with HTTP-only cookies
- User roles: CITIZEN, OFFICER, AUDITOR

### Identity (Optional)
- Hyperledger Identus for decentralized identity
- PRISM DIDs anchored to Cardano blockchain
- W3C Verifiable Credentials support

## Support

If you encounter issues:
1. Check the deployment logs in Vercel dashboard
2. Visit `/api/db-status` to diagnose database issues
3. Review `DATABASE_SETUP.md` for detailed database configuration
4. Check `VERCEL_DEPLOYMENT_GUIDE.md` for environment variable setup
