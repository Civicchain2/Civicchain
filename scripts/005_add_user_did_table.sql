-- Migration: Add UserDid table for optional DID wallet linking
-- This enables authenticated users to link a DIDComm wallet to their account
-- Executed: [Timestamp will be added when run]

-- Create UserDid table
CREATE TABLE IF NOT EXISTS "UserDid" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL UNIQUE,
  "did" TEXT NOT NULL UNIQUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "UserDid_userId_fkey" FOREIGN KEY ("userId") 
    REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "UserDid_userId_idx" ON "UserDid"("userId");
CREATE INDEX IF NOT EXISTS "UserDid_did_idx" ON "UserDid"("did");

-- Add comment
COMMENT ON TABLE "UserDid" IS 'Links DIDComm wallet DIDs to user accounts - optional post-registration feature';
