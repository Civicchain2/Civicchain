-- Add connections table to track DIDComm connection state
-- This stores the state of wallet connections between the backend and external holder wallets

CREATE TABLE IF NOT EXISTS connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_exchange_id TEXT NOT NULL UNIQUE,
  user_id UUID,
  invitation_url TEXT NOT NULL,
  invitation_payload JSONB NOT NULL,
  state TEXT NOT NULL DEFAULT 'invitation',
  role TEXT NOT NULL DEFAULT 'inviter',
  their_did TEXT,
  my_did TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for user lookups
CREATE INDEX IF NOT EXISTS idx_connections_user_id ON connections(user_id);

-- Index for connection exchange ID lookups
CREATE INDEX IF NOT EXISTS idx_connections_exchange_id ON connections(connection_exchange_id);

-- Index for state filtering
CREATE INDEX IF NOT EXISTS idx_connections_state ON connections(state);
