# DIDComm Wallet Connection Implementation Guide

This guide explains the DIDComm-based wallet connection flow implemented in CivicChain using Hyperledger Identus SDK.

## Overview

The wallet connection flow allows external holder wallets (Identus/PRISM compatible) to establish a secure DIDComm connection with the CivicChain backend. This is NOT a MetaMask-style wallet injection - it's a proper DIDComm peer-to-peer connection protocol.

## Architecture

```
┌─────────────────┐                    ┌──────────────────┐
│  Holder Wallet  │                    │  CivicChain      │
│  (External App) │                    │  Backend Agent   │
└────────┬────────┘                    └────────┬─────────┘
         │                                      │
         │   1. Frontend requests invitation   │
         │◄────────────────────────────────────┤
         │                                      │
         │   2. Backend creates peer DID       │
         │      and OOB invitation              │
         │                                      │
         │   3. QR code displayed              │
         │◄────────────────────────────────────┤
         │                                      │
         │   4. Holder scans QR code           │
         ├─────────────────────────────────────►
         │                                      │
         │   5. Wallet sends connection        │
         │      request via mediator           │
         ├─────────────────────────────────────►
         │                                      │
         │   6. Backend receives webhook       │
         │      and auto-accepts               │
         │                                      │
         │   7. Connection established         │
         │◄────────────────────────────────────┤
         │                                      │
         │   8. Frontend polls status          │
         │◄────────────────────────────────────┤
         │                                      │
```

## Backend Implementation

### 1. Database Schema

Run `scripts/006_add_connections_table.sql` to create the connections table that tracks connection state.

### 2. Connection Manager

`lib/identus/connection-manager.ts` provides server-side utilities to save, update, and query connection state.

### 3. API Endpoints

#### POST /api/identus/connect/invitation

Creates a DIDComm out-of-band invitation.

**Request:**
```json
{
  "userId": "user-uuid",
  "label": "CivicChain Platform"
}
```

**Response:**
```json
{
  "connectionId": "uuid",
  "connectionExchangeId": "conn_...",
  "invitationUrl": "https://example.com?_oob=...",
  "qrData": "https://example.com?_oob=...",
  "status": "invitation_created"
}
```

#### POST /api/identus/connect/webhook

Receives DIDComm messages from the mediator when holder responds.

**Note:** This endpoint must be publicly accessible. Configure your mediator to send messages here.

#### GET /api/identus/connect/:id

Poll for connection status updates.

**Response:**
```json
{
  "connectionId": "uuid",
  "state": "active",
  "theirDid": "did:peer:...",
  "myDid": "did:peer:..."
}
```

## Connection States

- **invitation**: QR code created, waiting for holder to scan
- **request_received**: Holder scanned, backend received connection request  
- **active**: Connection fully established and ready for credential exchange
- **error**: Something went wrong

## Frontend Integration (Placeholder)

### Step 1: Request Invitation

```typescript
const response = await fetch('/api/identus/connect/invitation', {
  method: 'POST',
  body: JSON.stringify({
    userId: currentUser.id,
    label: 'CivicChain Platform'
  })
});

const { connectionId, qrData } = await response.json();
```

### Step 2: Display QR Code

Use a QR code library to display `qrData` for the holder to scan with their Identus wallet.

```typescript
import QRCode from 'qrcode.react';

<QRCode value={qrData} size={256} />
```

### Step 3: Poll for Connection Status

```typescript
const pollInterval = setInterval(async () => {
  const status = await fetch(`/api/identus/connect/${connectionId}`);
  const { state } = await status.json();
  
  if (state === 'active') {
    clearInterval(pollInterval);
    // Connection established!
  }
}, 2000);
```

## Security Considerations

1. **Backend Only**: All Identus SDK operations run exclusively on the backend
2. **No Private Keys**: Holder's private keys never leave their wallet
3. **Peer DIDs**: Each connection uses a unique peer DID for privacy
4. **Mediator**: All messages are routed through a trusted mediator
5. **Webhook Security**: In production, add webhook authentication/signatures

## Testing

### Prerequisites

- An Identus-compatible wallet app (e.g., PRISM Agent mobile app)
- A publicly accessible webhook URL (use ngrok for local testing)

### Local Testing with ngrok

1. Start ngrok: `ngrok http 3000`
2. Update mediator configuration with ngrok URL + `/api/identus/connect/webhook`
3. Create invitation and scan with wallet app
4. Check logs for webhook messages

## Next Steps

After connection is established:
- Issue credentials to the holder's wallet
- Request proof presentations from the holder
- Manage credential revocation

## Troubleshooting

**QR code not scanning:**
- Verify the wallet app supports Identus/PRISM DIDs
- Check the invitation URL format

**Webhook not receiving messages:**
- Ensure webhook endpoint is publicly accessible
- Verify mediator configuration
- Check firewall/network settings

**Connection stays in "invitation" state:**
- Verify mediator is running and accessible
- Check that holder's wallet successfully sent request
- Review backend logs for errors

## References

- [Identus SDK Documentation](https://github.com/hyperledger/identus-edge-agent-sdk-ts)
- [DIDComm Messaging Spec](https://identity.foundation/didcomm-messaging/spec/)
- [Aries RFC 0434: Out-of-Band Protocol](https://github.com/hyperledger/aries-rfcs/tree/main/features/0434-outofband)
