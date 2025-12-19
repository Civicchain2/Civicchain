# Environment Variables Setup Guide

This guide explains where to get each environment variable for the CivicChain Identity Platform.

## ✅ Core Variables (Required)

### DATABASE_URL
**Status:** Already configured  
**Value:** Your Prisma Accelerate connection string  
**Action:** No action needed

### NEXT_PUBLIC_APP_URL
**Value:** `http://localhost:3000` (development) or your deployment URL (production)  
**Action:** Update when deploying to production

### SESSION_SECRET
**Value:** A random secure string  
**Action:** Generate a random string for production  
**Generate one:** Run `openssl rand -base64 32` in terminal

## 🔧 Identus DID Variables (Pre-configured with defaults)

### NEXT_PUBLIC_MEDIATOR_DID & IDENTUS_MEDIATOR_DID
**Status:** Pre-configured with RootsID public mediator  
**Default:** Working mediator for DIDComm connections  
**Action:** Can be left as-is for development and production  
**Custom Setup:** Only needed if you want to run your own mediator server

### IDENTUS_API_URL
**Status:** Pre-configured with RootsID mediator endpoint  
**Default:** `https://mediator.rootsid.cloud`  
**Action:** Can be left as-is  
**Custom Setup:** Only needed if you want to use a different mediator

## 🎴 Optional: Cardano Blockchain Variables

### NEXT_PUBLIC_BLOCKFROST_PROJECT_ID
**Required for:** Cardano wallet payments and blockchain queries  
**Status:** Optional - only needed if implementing payment features  
**Where to get it:**
1. Visit [Blockfrost.io](https://blockfrost.io/)
2. Sign up for a free account
3. Create a new project (choose Mainnet or Testnet)
4. Copy your Project ID from the dashboard

**Free Tier:** 50,000 requests/day

## 🚀 Quick Start

For immediate development, the current `.env` file is ready to use with:
- ✅ Database configured
- ✅ Identus mediator configured (using public RootsID mediator)
- ✅ Local development URL set

You only need to add:
1. `SESSION_SECRET` for production deployments
2. `NEXT_PUBLIC_BLOCKFROST_PROJECT_ID` if you want Cardano wallet features

## 📝 Production Checklist

Before deploying to production:
- [ ] Update `NEXT_PUBLIC_APP_URL` to your production domain
- [ ] Generate a secure `SESSION_SECRET`
- [ ] (Optional) Add `NEXT_PUBLIC_BLOCKFROST_PROJECT_ID` for blockchain features
- [ ] Verify DATABASE_URL is using production database

## 🔒 Security Notes

- Never commit `.env` to version control
- Use `.env.example` for template/documentation
- Rotate `SESSION_SECRET` periodically
- Keep `DATABASE_URL` secure (contains database credentials)
- Blockfrost API keys should be kept private

## 🆘 Need Help?

- **Database Issues:** Check [Prisma Accelerate Docs](https://www.prisma.io/docs/accelerate)
- **Identus/DID Issues:** Check [Identus Documentation](https://docs.atalaprism.io/)
- **Blockfrost:** Check [Blockfrost Docs](https://docs.blockfrost.io/)
