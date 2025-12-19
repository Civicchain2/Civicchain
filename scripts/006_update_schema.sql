-- Migration to update schema to match new requirements
-- This adds the documentHash field to Verification table

-- Add documentHash column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='Verification' AND column_name='documentHash') THEN
    ALTER TABLE "Verification" ADD COLUMN "documentHash" TEXT;
  END IF;
END $$;
