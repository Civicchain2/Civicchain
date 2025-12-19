# CivicChain Quick Start Guide

## For Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd civicchain
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your `DATABASE_URL`

4. **Initialize the database**
   ```bash
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   ```
   http://localhost:3000
   ```

## For Production Deployment on Vercel

### Step 1: Push Database Schema
```bash
# This MUST be done before deployment
npx prisma db push
```

### Step 2: Set Environment Variables in Vercel
1. Go to your Vercel project
2. Click Settings → Environment Variables
3. Add `DATABASE_URL` with your Prisma Accelerate connection string

### Step 3: Deploy
```bash
vercel --prod
```

### Step 4: Verify Deployment
Visit: `https://your-app.vercel.app/api/db-status`

Should show:
```json
{
  "envSet": true,
  "canConnect": true,
  "tablesExist": true,
  "details": {
    "message": "Database is properly configured and tables exist"
  }
}
```

## Troubleshooting

**"Database error" when registering?**
→ Run `npx prisma db push` to create the tables

**"Database not configured"?**
→ Add DATABASE_URL to Vercel environment variables and redeploy

**Build failing on Vercel?**
→ Check that Prisma version is 6.19.1 (not 7.x)

For detailed troubleshooting, see `DEPLOYMENT_CHECKLIST.md`
