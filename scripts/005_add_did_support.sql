-- Add DID column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS did TEXT UNIQUE;

-- Create index for faster DID lookups
CREATE INDEX IF NOT EXISTS idx_users_did ON users(did);

-- Create credentials table for storing issued verifiable credentials
CREATE TABLE IF NOT EXISTS credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  issuer_did TEXT NOT NULL,
  subject_did TEXT NOT NULL,
  credential_type TEXT NOT NULL,
  credential_data JSONB NOT NULL,
  issued_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  revoked BOOLEAN DEFAULT FALSE,
  revoked_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for credentials
CREATE INDEX IF NOT EXISTS idx_credentials_user_id ON credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_credentials_subject_did ON credentials(subject_did);
CREATE INDEX IF NOT EXISTS idx_credentials_issuer_did ON credentials(issuer_did);
CREATE INDEX IF NOT EXISTS idx_credentials_type ON credentials(credential_type);

-- Add comments for documentation
COMMENT ON TABLE credentials IS 'Stores verifiable credentials issued by the platform';
COMMENT ON COLUMN credentials.credential_data IS 'Full W3C Verifiable Credential JSON';
COMMENT ON COLUMN credentials.revoked IS 'Whether this credential has been revoked';
