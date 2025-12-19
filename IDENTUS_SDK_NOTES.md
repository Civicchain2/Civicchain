# Identus SDK Integration Notes

## Current Status

The Hyperledger Identus Edge Agent SDK (@hyperledger/identus-edge-agent-sdk) has been temporarily disabled due to build issues.

## Issues Encountered

1. **Missing Peer Dependencies**: The SDK requires `rxdb` and its plugins which are not properly configured as peer dependencies
2. **Build Failures**: Turbopack/Next.js cannot resolve the following modules:
   - `rxdb`
   - `rxdb/plugins/json-dump`
   - `rxdb/plugins/query-builder`
   - `rxdb/plugins/update`
3. **Export Issues**: The `Agent` export doesn't exist in the expected location

## Current Implementation

The codebase now uses a **mock agent** in `lib/identus/agent.ts` that provides:
- Mock DID generation (format: `did:prism:{timestamp}{random}`)
- Basic interface compatibility with the original SDK
- No external dependencies that cause build failures

## Recommended Solutions

### Option 1: Use Identus Cloud API (Recommended)

Instead of the Edge Agent SDK, use the Identus Cloud API directly:

```typescript
// Call Identus Cloud API endpoints
const response = await fetch('https://cloud.atalaprism.io/prism-agent/dids', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.IDENTUS_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    documentTemplate: {
      publicKeys: [/* ... */],
      services: [/* ... */]
    }
  })
})
```

Benefits:
- No complex client-side dependencies
- Better for server-side Next.js applications
- Officially supported by IOG/Input Output
- Easier to maintain and debug

### Option 2: Fix RxDB Dependencies

If you need the Edge Agent SDK:

1. Install rxdb and required plugins:
```bash
npm install rxdb@15.x
```

2. Configure Next.js to handle the SDK properly:
```javascript
// next.config.js
module.exports = {
  experimental: {
    serverComponentsExternalPackages: ['rxdb', '@hyperledger/identus-edge-agent-sdk']
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    return config
  }
}
```

3. Use dynamic imports to load only on client-side:
```typescript
// Only import in client components
const { Agent } = await import('@hyperledger/identus-edge-agent-sdk')
```

### Option 3: Client-Side Only Implementation

Move all Identus SDK operations to client-side:
- Use browser-based wallets only
- Store DIDs in browser IndexedDB
- Never import the SDK in API routes or server components

## Authentication Without Identus SDK

The current implementation works without the SDK:
- **Authentication**: Uses bcrypt password hashing with Prisma database
- **User Management**: Fully functional with PostgreSQL
- **DIDs**: Generated as mock identifiers for development
- **Verifications**: Stored in database with standard IDs

## Migration Path

When ready to implement real Identus integration:

1. Choose Option 1 (Cloud API) for production apps
2. Replace mock DIDs with real API calls
3. Update verification credential storage
4. Implement proper key management

## References

- [Identus Documentation](https://docs.atalaprism.io/)
- [Identus Cloud API](https://docs.atalaprism.io/docs/atala-prism/prism-cloud)
- [Edge Agent SDK Issues](https://github.com/input-output-hk/atala-prism-wallet-sdk-ts/issues)
</markdown>
