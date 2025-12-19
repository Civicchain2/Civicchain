# Mediator Identity Integration Guide

## What is a DIDComm Mediator?

A **mediator** is a trusted service that routes DIDComm messages between parties who may not be directly reachable (e.g., mobile wallets behind NAT, offline devices). Think of it as a secure message relay for decentralized identity communications.

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Wallet    │◄────────│   Mediator   │────────►│  Your App   │
│  (Holder)   │         │   (Router)   │         │  (Issuer)   │
└─────────────┘         └──────────────┘         └─────────────┘
     (DID A)                 (DID M)                  (DID B)
```

## Why Do You Need a Mediator?

1. **Asynchronous Communication**: Mobile wallets aren't always online
2. **NAT Traversal**: Wallets behind firewalls/NAT can still receive messages
3. **Privacy**: Direct peer-to-peer without revealing IP addresses
4. **Queue Management**: Messages are queued until the recipient polls for them

## Quick Start: Using the Default Public Mediator

The CivicChain platform comes pre-configured with the **RootsID public mediator**, which is free and ready to use.

### Current Configuration

Your `.env` file is already set up:

```env
# DIDComm Mediator (pre-configured with RootsID public mediator)
NEXT_PUBLIC_MEDIATOR_DID="did:peer:2.Ez6LSms555YhFthn1WV8ciDBpZm86hK9tp83WojJUmxPGk1hZ.Vz6MkmdBjMyB4TS5UbbQw54szm8yvMMf1ftGV2sQVYAxaeWhE.SeyJpZCI6Im5ldy1pZCIsInQiOiJkbSIsInMiOnsidXJpIjoiaHR0cHM6Ly9tZWRpYXRvci5yb290c2lkLmNsb3VkIiwiYSI6WyJkaWRjb21tL3YyIl19fQ"
IDENTUS_MEDIATOR_DID="did:peer:2.Ez6LSms555YhFthn1WV8ciDBpZm86hK9tp83WojJUmxPGk1hZ.Vz6MkmdBjMyB4TS5UbbQw54szm8yvMMf1ftGV2sQVYAxaeWhE.SeyJpZCI6Im5ldy1pZCIsInQiOiJkbSIsInMiOnsidXJpIjoiaHR0cHM6Ly9tZWRpYXRvci5yb290c2lkLmNsb3VkIiwiYSI6WyJkaWRjb21tL3YyIl19fQ"
IDENTUS_API_URL="https://mediator.rootsid.cloud"
```

### RootsID Public Mediator Details

- **Provider**: RootsID
- **Endpoint**: https://mediator.rootsid.cloud
- **Status**: Production-ready, publicly available
- **Cost**: Free
- **Limitations**: Shared infrastructure, basic SLA
- **Best For**: Development, testing, and small-scale production use

### Verifying Mediator Connection

1. Check that your app starts without errors
2. The Identus Agent will automatically connect to the mediator on initialization
3. Check your application logs for successful agent startup

```typescript
// This happens automatically when any Identus API is called
import { getIdentusAgent } from '@/lib/identus/agent'

const agent = await getIdentusAgent()
// Agent is now connected to the mediator
```

## Advanced: Setting Up Your Own Mediator

For production deployments requiring:
- Custom SLA guarantees
- Data sovereignty requirements
- High message throughput
- Custom routing logic

You should consider hosting your own mediator.

### Option 1: Identus Cloud Agent Mediator

**Prerequisites:**
- Docker and Docker Compose installed
- A server with a public IP address or domain
- SSL certificate for HTTPS

**Step 1: Clone the Identus Cloud Agent**

```bash
git clone https://github.com/hyperledger/identus-cloud-agent.git
cd identus-cloud-agent
```

**Step 2: Configure Environment**

Create a `.env` file:

```env
# Mediator Configuration
MEDIATOR_HTTP_PORT=8000
MEDIATOR_DIDCOMM_PORT=8080
MEDIATOR_PUBLIC_URL=https://mediator.yourdomain.com

# Database
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=mediator
POSTGRES_USER=mediator
POSTGRES_PASSWORD=your-secure-password

# Logging
LOG_LEVEL=INFO
```

**Step 3: Start the Mediator**

```bash
docker-compose up -d
```

**Step 4: Get Your Mediator DID**

```bash
curl https://mediator.yourdomain.com/.well-known/did.json
```

This returns your mediator's DID. Copy the `id` field.

**Step 5: Update Your CivicChain Configuration**

Update your `.env` file:

```env
NEXT_PUBLIC_MEDIATOR_DID="<your-mediator-did-from-step-4>"
IDENTUS_MEDIATOR_DID="<your-mediator-did-from-step-4>"
IDENTUS_API_URL="https://mediator.yourdomain.com"
```

### Option 2: RootsID Self-Hosted Mediator

RootsID also provides a lightweight self-hosted mediator option.

**Step 1: Clone the RootsID Mediator**

```bash
git clone https://github.com/roots-id/didcomm-mediator.git
cd didcomm-mediator
```

**Step 2: Install Dependencies**

```bash
npm install
```

**Step 3: Configure**

Create a `config.json`:

```json
{
  "port": 3000,
  "publicUrl": "https://mediator.yourdomain.com",
  "storage": {
    "type": "mongodb",
    "url": "mongodb://localhost:27017/mediator"
  }
}
```

**Step 4: Start the Mediator**

```bash
npm run start
```

**Step 5: Register Your Mediator DID**

The mediator will generate a DID on first startup. Check the logs for:

```
[INFO] Mediator started with DID: did:peer:...
```

**Step 6: Update CivicChain Configuration**

Update `.env` with your new mediator DID and URL.

### Option 3: Atala PRISM Mediator (Enterprise)

For enterprise deployments, IOG (Input Output Global) offers a managed mediator service as part of Atala PRISM.

**Contact**: https://www.atalaprism.io/contact

**Features**:
- Enterprise SLA (99.9% uptime)
- Dedicated infrastructure
- Technical support
- Custom routing rules
- Analytics and monitoring

## Mediator DID Format Explained

A mediator DID is a `did:peer` identifier with embedded service endpoints.

**Example Breakdown**:

```
did:peer:2.Ez6LSms555YhFthn1WV8ciDBpZm86hK9tp83WojJUmxPGk1hZ.Vz6MkmdBjMyB4TS5UbbQw54szm8yvMMf1ftGV2sQVYAxaeWhE.SeyJpZCI6Im5ldy1pZCIsInQiOiJkbSIsInMiOnsidXJpIjoiaHR0cHM6Ly9tZWRpYXRvci5yb290c2lkLmNsb3VkIiwiYSI6WyJkaWRjb21tL3YyIl19fQ
```

**Components**:
1. `did:peer:2` - DID method (peer DID, method 2)
2. `Ez6LS...` - Key agreement key (encryption key)
3. `Vz6Mk...` - Authentication key (signing key)
4. `SeyJp...` - Base64url-encoded service endpoint (the actual mediator URL)

**Decode the Service Endpoint**:

```javascript
const serviceB64 = "SeyJpZCI6Im5ldy1pZCIsInQiOiJkbSIsInMiOnsidXJpIjoiaHR0cHM6Ly9tZWRpYXRvci5yb290c2lkLmNsb3VkIiwiYSI6WyJkaWRjb21tL3YyIl19fQ"
const service = JSON.parse(atob(serviceB64))
console.log(service)
// Output: { id: "new-id", t: "dm", s: { uri: "https://mediator.rootsid.cloud", a: ["didcomm/v2"] } }
```

## How the Agent Uses the Mediator

### Initialization (lib/identus/agent.ts)

```typescript
const agent = Agent.initialize({
  mediatorDID: process.env.NEXT_PUBLIC_MEDIATOR_DID || "<default-mediator-did>"
})

await agent.start()
```

When the agent starts:
1. It parses the mediator DID to extract the service endpoint
2. Establishes a connection to the mediator
3. Registers to receive messages through the mediator
4. All outbound DIDComm messages are routed through the mediator

### Message Flow

**Sending a Message**:
```
Your Agent → Mediator → Recipient's Agent (via their mediator)
```

**Receiving a Message**:
```
Sender's Agent → Mediator → Your Webhook → Your Agent processes message
```

## Webhook Configuration for Your Mediator

Your mediator needs to know where to deliver incoming messages.

### Step 1: Expose a Public Webhook Endpoint

Your app already has a webhook at:
```
POST /api/identus/connect/webhook
```

This endpoint must be **publicly accessible** via HTTPS.

### Step 2: Configure the Mediator

The exact method depends on your mediator implementation:

**RootsID Public Mediator** (Default):
- No configuration needed
- Messages are queued and retrieved via polling

**Self-Hosted Mediator**:
Add your webhook URL to the mediator's configuration:

```json
{
  "webhooks": [
    {
      "url": "https://your-civicchain-app.com/api/identus/connect/webhook",
      "events": ["message.received", "connection.request"]
    }
  ]
}
```

### Step 3: Test the Webhook

```bash
# Send a test message to your webhook
curl -X POST https://your-app.com/api/identus/connect/webhook \
  -H "Content-Type: application/json" \
  -d '{"type": "test", "message": "ping"}'
```

## Local Development with ngrok

For local testing, you need a public URL for your webhook.

### Step 1: Install ngrok

```bash
# macOS
brew install ngrok

# Linux
wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz
tar xvzf ngrok-v3-stable-linux-amd64.tgz
```

### Step 2: Start Your Local Server

```bash
npm run dev
# Server running on http://localhost:3000
```

### Step 3: Expose with ngrok

```bash
ngrok http 3000
```

You'll see output like:
```
Forwarding  https://abc123.ngrok.io -> http://localhost:3000
```

### Step 4: Configure Your Webhook

Use the ngrok URL for webhook configuration:
```
https://abc123.ngrok.io/api/identus/connect/webhook
```

## Troubleshooting

### Agent Fails to Start

**Error**: `Failed to connect to mediator`

**Solutions**:
1. Check that `NEXT_PUBLIC_MEDIATOR_DID` is set correctly
2. Verify the mediator service is online (test the URL in the DID)
3. Check firewall rules allow outbound HTTPS to mediator
4. Review agent logs for detailed error messages

### Messages Not Being Delivered

**Error**: Connections stay in `invitation` state

**Solutions**:
1. Verify your webhook endpoint is publicly accessible
2. Check mediator configuration includes your webhook URL
3. Test webhook manually with curl
4. Check for errors in `/api/identus/connect/webhook` logs
5. Ensure holder wallet is connected to the same mediator

### Mediator DID Parse Error

**Error**: `Invalid DID format`

**Solutions**:
1. Ensure the entire DID string is copied (they're very long)
2. No extra spaces or line breaks in the DID
3. Verify it starts with `did:peer:`
4. Test the DID with an online DID resolver

### Webhook Returns 401/403

**Issue**: Mediator can't deliver messages due to authentication errors

**Solutions**:
1. If you added authentication to your webhook, whitelist the mediator's IP
2. Add a shared secret header check:

```typescript
// In /api/identus/connect/webhook/route.ts
const secret = request.headers.get('x-webhook-secret')
if (secret !== process.env.MEDIATOR_WEBHOOK_SECRET) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

## Security Considerations

### Mediator Trust

- The mediator can see message metadata (sender, recipient, timestamps)
- The mediator **cannot** read message content (end-to-end encrypted)
- Choose a mediator you trust for availability and privacy

### Message Encryption

All DIDComm messages are encrypted end-to-end:
```
Your Agent encrypts → Mediator routes (can't decrypt) → Recipient decrypts
```

### Webhook Security

Protect your webhook endpoint:

```typescript
// Add rate limiting
import { Ratelimit } from '@upstash/ratelimit'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m')
})

// In webhook handler
const { success } = await ratelimit.limit(ip)
if (!success) {
  return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
}
```

## Production Checklist

- [ ] Choose mediator (public RootsID or self-hosted)
- [ ] Configure `NEXT_PUBLIC_MEDIATOR_DID` environment variable
- [ ] Configure `IDENTUS_API_URL` environment variable
- [ ] Ensure webhook endpoint is publicly accessible via HTTPS
- [ ] Configure mediator with your webhook URL
- [ ] Test message delivery end-to-end
- [ ] Set up monitoring for webhook failures
- [ ] Configure rate limiting on webhook
- [ ] Set up alerting for mediator downtime
- [ ] Document mediator choice and configuration for team

## Monitoring and Maintenance

### Health Checks

Add a mediator health check:

```typescript
// /app/api/identus/health/route.ts
import { getIdentusAgent } from '@/lib/identus/agent'

export async function GET() {
  try {
    const agent = await getIdentusAgent()
    // Agent successfully initialized = mediator is reachable
    return NextResponse.json({ 
      status: 'healthy',
      mediator: 'connected'
    })
  } catch (error) {
    return NextResponse.json({ 
      status: 'unhealthy',
      mediator: 'unreachable',
      error: error.message
    }, { status: 503 })
  }
}
```

### Metrics to Track

1. **Message Delivery Time**: Time from send to webhook receipt
2. **Failed Deliveries**: Webhook errors or timeouts
3. **Connection Success Rate**: % of connections that reach `active` state
4. **Mediator Uptime**: Availability of the mediator service

## Next Steps

1. **Test with the default mediator**: Verify basic connectivity works
2. **Create a DIDComm connection**: Follow the [DIDComm Connection Guide](./DIDCOMM_CONNECTION_GUIDE.md)
3. **Plan for production**: Decide if you need a self-hosted mediator
4. **Set up monitoring**: Implement health checks and alerting

## Resources

- [DIDComm Messaging Specification](https://identity.foundation/didcomm-messaging/spec/)
- [DID Peer Method Spec](https://identity.foundation/peer-did-method-spec/)
- [RootsID Mediator](https://github.com/roots-id/didcomm-mediator)
- [Identus Cloud Agent](https://github.com/hyperledger/identus-cloud-agent)
- [Atala PRISM Enterprise](https://www.atalaprism.io/)
