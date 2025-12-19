# Identus SDK Integration Guide

This document explains how the Hyperledger Identus SDK is integrated into the CivicChain platform for decentralized identity management.

## Architecture

The integration follows a **strict backend-only pattern** to ensure security:

```
Frontend (React Components)
    ↓ (API calls only)
Backend API Routes (/app/api/identus/*)
    ↓ (Server-side SDK usage)
Identus Agent (lib/identus/agent.ts)
    ↓
Hyperledger Identus SDK
    ↓
Cardano Blockchain (for DID anchoring)
```

## Security Model

- **NO client-side SDK usage**: The Identus SDK is ONLY imported in backend files
- **Private keys stay server-side**: All cryptographic operations happen in API routes
- **Agent singleton**: A single Agent instance is reused across requests for efficiency

## API Endpoints

### 1. Create DID: `POST /api/identus/did/create`

Creates a new PRISM DID anchored to Cardano.

**Request:**
```json
{
  "userId": "user-123"
}
```

**Response:**
```json
{
  "did": "did:prism:...",
  "userId": "user-123",
  "status": "created",
  "message": "PRISM DID created successfully"
}
```

**Usage Example (from frontend):**
```typescript
const response = await fetch('/api/identus/did/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId: currentUser.id })
});
const { did } = await response.json();
```

### 2. Issue Credential: `POST /api/identus/credential/issue`

Issues a Verifiable Credential to a subject.

**Request:**
```json
{
  "issuerDID": "did:prism:issuer...",
  "subjectDID": "did:prism:subject...",
  "credentialType": "VerifiedCitizen",
  "claims": {
    "fullName": "John Doe",
    "nationality": "US",
    "verificationLevel": "KYC1"
  }
}
```

**Response:**
```json
{
  "credential": { /* W3C Verifiable Credential */ },
  "status": "issued",
  "message": "Verifiable Credential issued successfully"
}
```

### 3. Verify Credential: `POST /api/identus/credential/verify`

Verifies a Verifiable Credential's authenticity.

**Request:**
```json
{
  "credential": { /* W3C Verifiable Credential object */ }
}
```

**Response:**
```json
{
  "isValid": true,
  "credential": {
    "type": ["VerifiableCredential", "VerifiedCitizen"],
    "issuer": "did:prism:issuer...",
    "subject": "did:prism:subject..."
  },
  "status": "valid",
  "message": "Credential is valid"
}
```

## Integration with Existing Features

### User Registration Flow

When a user registers, you can automatically create a DID for them:

```typescript
// In your registration handler
const userResponse = await registerUser(userData);
const didResponse = await fetch('/api/identus/did/create', {
  method: 'POST',
  body: JSON.stringify({ userId: userResponse.id })
});
```

### Verification Submission Flow

When an officer verifies a citizen's documents, issue a credential:

```typescript
// In your verification approval handler
await fetch('/api/identus/credential/issue', {
  method: 'POST',
  body: JSON.stringify({
    issuerDID: officerDID,
    subjectDID: citizenDID,
    credentialType: 'VerifiedIdentity',
    claims: {
      verifiedAt: new Date().toISOString(),
      documentType: 'passport',
      verificationLevel: 'full'
    }
  })
});
```

## Environment Variables

Required environment variables:

- `NEXT_PUBLIC_MEDIATOR_DID`: DIDComm mediator endpoint (optional, has default)

## Database Schema Recommendations

Store DIDs and credentials in your existing database:

```sql
-- Add to users table
ALTER TABLE users ADD COLUMN did TEXT UNIQUE;

-- Create credentials table
CREATE TABLE credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  credential_type TEXT NOT NULL,
  credential_data JSONB NOT NULL,
  issued_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  revoked BOOLEAN DEFAULT FALSE
);
```

## Next Steps

1. **Test the endpoints**: Use the API routes to create DIDs and issue credentials
2. **Integrate with registration**: Call `/api/identus/did/create` when users sign up
3. **Issue credentials on verification**: Call `/api/identus/credential/issue` when officers approve documents
4. **Add persistent storage**: Replace in-memory storage with database-backed storage for DIDs
5. **Implement revocation**: Add credential revocation for withdrawn verifications
6. **Add DID authentication**: Use DIDs for passwordless login via DIDComm

## Official Documentation

- Identus SDK Docs: https://hyperledger-identus.github.io/docs/sdk-ts/
- GitHub Repository: https://github.com/hyperledger/identus-edge-agent-sdk-ts
- API Reference: https://hyperledger-identus.github.io/docs/sdk-ts/sdk/
```

```json file="" isHidden
