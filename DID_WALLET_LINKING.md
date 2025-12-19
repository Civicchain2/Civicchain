# DID Wallet Linking Feature

## Overview

This feature enables **optional** DIDComm wallet linking for authenticated users. This is NOT a replacement for the primary authentication system but rather an additional trust anchor for credential flows.

## Key Principles

1. **Normal authentication is primary** - Email/password login remains the main authentication method
2. **DID linking is optional** - Users can choose to link a wallet or not
3. **Post-registration only** - Users must be authenticated before they can link a DID
4. **One DID per user** - Each user can only link one DID wallet
5. **One user per DID** - Each DID can only be linked to one user account
6. **Backend-only SDK** - Identus SDK is never exposed to the browser

## Architecture

### Database Schema

```prisma
model UserDid {
  id        String   @id @default(uuid())
  userId    String   @unique
  did       String   @unique
  createdAt DateTime @default(now())
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### API Endpoints

#### POST /api/identus/link/start
- **Authentication**: Required
- **Purpose**: Start the DID linking process
- **Returns**: DIDComm connection invitation URL

#### POST /api/identus/link/complete
- **Authentication**: Required
- **Purpose**: Complete the DID linking after connection is established
- **Validates**: Connection state, ownership, uniqueness

#### GET /api/identus/link/status
- **Authentication**: Required
- **Purpose**: Check if user has a linked DID
- **Returns**: Linking status and DID if linked

#### POST /api/identus/link/unlink
- **Authentication**: Required
- **Purpose**: Remove DID wallet link from user account

### Frontend Components

#### DidWalletLink Component
Located in: `components/settings/did-wallet-link.tsx`

Features:
- Shows current linking status
- Generates connection invitation
- Displays QR code / invitation URL
- Polls for connection completion
- Handles unlinking

#### Integration Points
- Citizen Settings: `/citizen/settings` (Wallet tab)
- Officer Settings: `/officer/settings` (Wallet tab)
- Auditor Settings: `/auditor/settings` (Wallet tab)

## Security Validations

1. **Authentication Check**: All endpoints require valid session
2. **Connection Ownership**: Users can only complete connections they initiated
3. **Connection State**: Only completed connections can be linked
4. **Duplicate Prevention**: 
   - One DID cannot be linked to multiple users
   - One user cannot link multiple DIDs
5. **Database Constraints**: Unique constraints on userId and did fields

## User Flow

1. User logs in with email/password
2. User navigates to Settings > Wallet tab
3. User clicks "Link DID Wallet"
4. System generates DIDComm connection invitation
5. User scans invitation with compatible wallet app
6. System polls for connection completion
7. Once connected, DID is linked to user account
8. User can view linked DID or unlink if needed

## Use Cases

- **Trust Anchor**: Linked DID serves as additional trust signal
- **Credential Flows**: Can use linked DID for issuing/verifying credentials
- **Multi-Factor**: Potential use as secondary authentication factor
- **SSI Integration**: Bridge between traditional auth and self-sovereign identity

## Important Notes

- Linking a wallet does NOT replace password authentication
- Unlinked users have full system access
- This is designed for gradual SSI adoption
- Compatible with any DIDComm-compliant wallet
- Identus SDK operations remain server-side only
