# Identus Cloud Agent Setup Guide

This project now uses the **Identus Cloud Agent REST API** instead of the Edge Agent SDK to avoid build complexity and provide a more robust solution.

## What is Identus Cloud Agent?

The Identus Cloud Agent is a server-side REST API service that provides:
- PRISM DID creation and management
- Verifiable Credential issuance and verification
- W3C standards compliance
- Blockchain anchoring for DIDs
- Production-ready decentralized identity operations

## Quick Start Options

### Option 1: Use Hosted Identus Cloud Agent (Easiest)

If you have access to a hosted Identus Cloud Agent, simply configure the URL:

```env
IDENTUS_CLOUD_AGENT_URL="https://your-identus-agent.example.com"
IDENTUS_API_KEY="your-api-key"
```

### Option 2: Run Local Identus Cloud Agent (Recommended for Development)

#### Prerequisites
- Docker and Docker Compose installed
- 8GB+ RAM available
- Ports 8080, 8085, 5432 available

#### Setup Steps

1. **Clone the Identus Cloud Agent repository:**
```bash
git clone https://github.com/hyperledger-identus/cloud-agent.git
cd cloud-agent
```

2. **Start the Cloud Agent with Docker Compose:**
```bash
docker-compose up -d
```

This will start:
- Identus Cloud Agent API (port 8080)
- PRISM Node (port 8085)
- PostgreSQL database (port 5432)

3. **Verify the agent is running:**
```bash
curl http://localhost:8080/cloud-agent/_system/health
```

Expected response:
```json
{
  "status": "OK"
}
```

4. **Configure your CivicChain app:**
```env
IDENTUS_CLOUD_AGENT_URL="http://localhost:8080/cloud-agent"
```

5. **Test the integration:**

Visit your app's health endpoint:
```
http://localhost:3000/api/identus/health
```

### Option 3: Deploy Your Own Cloud Agent (Production)

For production deployments:

1. **Choose a deployment platform:**
   - AWS ECS/EKS
   - Google Cloud Run / GKE
   - Azure Container Instances / AKS
   - DigitalOcean Droplet
   - Self-hosted Kubernetes

2. **Use the official Docker image:**
```bash
docker pull ghcr.io/hyperledger-identus/cloud-agent:latest
```

3. **Set up a PostgreSQL database** (required for the agent)

4. **Configure environment variables:**
```env
PRISM_NODE_HOST=your-prism-node-host
DATABASE_URL=postgresql://user:password@host:5432/identus
API_KEY_ENABLED=true
API_KEY_SECRET=your-secret-key
```

5. **Deploy and expose via HTTPS** (use a reverse proxy like nginx or cloud load balancer)

## Configuration

### Environment Variables

Add these to your `.env` file:

```env
# Identus Cloud Agent Configuration
IDENTUS_CLOUD_AGENT_URL="http://localhost:8080/cloud-agent"
IDENTUS_API_KEY=""  # Optional: Only needed if agent has authentication enabled

# For production
# IDENTUS_CLOUD_AGENT_URL="https://your-identus-agent.example.com"
# IDENTUS_API_KEY="your-production-api-key"
```

## API Endpoints Used

The CivicChain platform uses the following Cloud Agent endpoints:

### DID Operations
- `POST /did-registrar/dids` - Create new PRISM DIDs
- `GET /dids/{did}` - Resolve DIDs
- `PUT /dids/{did}` - Update DIDs
- `POST /dids/{did}/deactivate` - Deactivate DIDs

### Credential Operations
- `POST /schema-registry/schemas` - Create credential schemas
- `POST /issue-credentials/credential-offers` - Issue credentials
- `POST /present-proof/presentations/verify` - Verify credentials

### System
- `GET /_system/health` - Check agent health

## Testing the Integration

1. **Check agent health:**
```bash
curl http://localhost:3000/api/identus/health
```

2. **Create a test DID:**
```bash
curl -X POST http://localhost:3000/api/identus/did/create-for-user \
  -H "Content-Type: application/json" \
  -d '{"userId": "your-user-id"}'
```

3. **Register a new user** - This will automatically create a DID via the Cloud Agent

## Fallback Behavior

If the Cloud Agent is not reachable, the system will:
- Generate mock DIDs for development (format: `did:prism:{timestamp}{random}`)
- Log warnings about Cloud Agent unavailability
- Continue to function for non-DID features
- Display warnings in the UI about DID functionality

This ensures the app remains functional even during Cloud Agent maintenance.

## Troubleshooting

### Cloud Agent Not Starting

**Issue:** Docker containers fail to start
```bash
docker-compose logs cloud-agent
```

**Common fixes:**
- Ensure ports 8080, 8085, 5432 are not in use
- Check Docker has enough memory (8GB+ recommended)
- Verify PostgreSQL is initialized correctly

### Connection Refused

**Issue:** `ECONNREFUSED` when calling Cloud Agent

**Fixes:**
- Verify Cloud Agent is running: `curl http://localhost:8080/cloud-agent/_system/health`
- Check `IDENTUS_CLOUD_AGENT_URL` in `.env` matches your agent URL
- Ensure no firewall is blocking the connection

### DID Creation Fails

**Issue:** DIDs are not being created

**Fixes:**
- Check Cloud Agent logs: `docker-compose logs cloud-agent`
- Verify PRISM Node is running: `docker-compose ps`
- Check agent has database connectivity
- Ensure blockchain connection is established

### Authentication Errors

**Issue:** `401 Unauthorized` responses

**Fixes:**
- Check if `IDENTUS_API_KEY` is set correctly
- Verify the Cloud Agent has API key authentication enabled
- Match the API key with the agent's configuration

## Resources

- [Identus Documentation](https://docs.atalaprism.io/)
- [Cloud Agent GitHub](https://github.com/hyperledger-identus/cloud-agent)
- [API Documentation](https://hyperledger.github.io/identus-docs/agent-api/)
- [Identus Developer Handbook](https://identusbook.com/)
- [Hyperledger Identus Discord](https://discord.gg/identus)

## Next Steps

Once the Cloud Agent is running:

1. Test DID creation by registering a new user
2. Implement credential issuance for verification workflows
3. Set up credential schemas for your use case
4. Configure production deployment with HTTPS
5. Set up monitoring and alerting for the Cloud Agent
