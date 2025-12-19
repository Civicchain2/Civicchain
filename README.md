# CivicChain Identity Platform

CivicChain is a **next-generation civic identity and payment platform** combining blockchain security with trusted government services. Built on the **Cardano blockchain** and powered by **Hyperledger Identus**, CivicChain delivers **self-sovereign identity (SSI)** solutions that put citizens in control of their data while ensuring compliance and transparency.

## Key Problems We Solve

* Fragmented identity systems across agencies
* Privacy concerns from centralized databases
* Slow manual verification processes
* Non-portable credentials
* Payment friction and high fees
* Lack of auditability and transparency

## Core Solution

CivicChain provides a **secure, interoperable platform** for:

1. **Self-Sovereign Digital Identity** – Users own and control their identity credentials.
2. **Instant Verification** – Real-time credential verification on the blockchain.
3. **Secure Payments** – Low-cost, transparent transactions on Cardano.
4. **Role-Based Access Control (RBAC)** – Citizens, Officers, and Auditors with tailored experiences.
5. **Privacy-First Design** – Selective disclosure and zero-knowledge proofs.
6. **Complete Auditability** – Immutable logs for regulatory compliance.

## Key Features

* **Decentralized Identifiers (DIDs)** anchored to Cardano blockchain
* **Verifiable Credentials** for identity, licenses, and certificates
* **DIDComm Messaging & Wallet Linking** for secure peer-to-peer interactions
* **Cardano Blockchain Integration** for payments and immutable records
* **Real-Time Verification Pipeline** for document and credential processing
* **Comprehensive Audit System** for risk assessment and compliance

## Technical Stack

* **Frontend:** Next.js 16 + React 19, server components, role-based dashboards
* **Backend:** Next.js App Router, RESTful APIs, JWT authentication
* **Blockchain:** Cardano prepod, Hyperledger Identus SDK for DIDs & Verifiable Credentials
* **Database:** PostgreSQL with Prisma ORM, Prisma Accelerate for edge optimization
* **Security:** End-to-end encryption, zero trust model, secure key management


## Technical Architecture Highlights

### Modern Full-Stack Architecture
```
┌─────────────────────────────────────────┐
│   Frontend (Next.js 16 + React 19)     │
│   - Server Components for performance   │
│   - Role-based dashboards              │
│   - Real-time updates                  │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│   API Layer (Next.js App Router)        │
│   - RESTful endpoints                   │
│   - Authentication middleware           │
│   - Rate limiting & validation          │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│   Business Logic Layer                  │
│   ├─ Identus Agent (DID/VC operations) │
│   ├─ Auth Service (sessions)           │
│   └─ Connection Manager (DIDComm)      │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│   Data Layer (Prisma ORM)               │
│   - Type-safe database queries          │
│   - Migration management                │
│   - Connection pooling                  │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│   PostgreSQL Database                   │
│   (Prisma Accelerate for global edge)  │
└─────────────────────────────────────────┘
```

## Use Cases

* National ID & digital identity verification
* Professional licensing and credential verification
* Educational credential verification
* Patient-controlled healthcare records
* Government benefits distribution
* Secure digital voting

## Getting Started

1. Clone the repository and install dependencies
2. Configure PostgreSQL database and environment variables
3. Run database migrations
4. Start the development server

## APIs

* `POST /api/auth/register` – Register a user
* `POST /api/auth/login` – Login a user
* `POST /api/identus/did/create-for-user` – Create DID
* `POST /api/identus/credential/issue` – Issue credential
* `POST /api/identus/credential/verify` – Verify credential
* `GET /api/verifications/get` – Fetch verifications
* `POST /api/verifications/submit` – Submit verification

## Business Value

* Faster verification: seconds vs. days/weeks
* Reduced costs: up to 75% lower verification costs
* Fraud prevention and transparency
* Cross-institution credential interoperability
* Scalable, government-compliant digital identity solution



**CivicChain: Empowering citizens, streamlining government, ensuring privacy.**


## Quick Start

### 1. Clone and Install

```bash
npm install
```

### 2. Set Up Environment Variables

The `.env` file is already configured with your database connection:

```bash
# Database (configured)
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=..."

# App URL (optional, defaults to http://localhost:3000)
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Identus Configuration (optional)
IDENTUS_MEDIATOR_URL="https://your-mediator-url"
```

### 3. Set Up Database

Generate Prisma client and push schema to database:

```bash
npm run db:generate
npm run db:push
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/                    # Next.js app router pages
│   ├── api/               # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── verifications/ # Verification endpoints
│   │   └── identus/      # Identus DID/credential endpoints
│   ├── citizen/          # Citizen dashboard
│   ├── officer/          # Government officer dashboard
│   └── auditor/          # Auditor dashboard
├── components/            # React components
│   ├── auth/             # Authentication forms
│   ├── citizen/          # Citizen-specific components
│   ├── officer/          # Officer-specific components
│   └── auditor/          # Auditor-specific components
├── lib/                   # Utility libraries
│   ├── identus/          # Identus SDK integration
│   ├── auth.ts           # Authentication utilities
│   └── prisma.ts         # Prisma client
├── prisma/               # Database schema and migrations
│   └── schema.prisma     # Database schema
└── scripts/              # Database scripts
```

## Database Schema

The application uses the following main tables:

- **User** - User accounts with role-based access
- **Session** - Authentication sessions
- **Verification** - Identity verification requests
- **Transaction** - Transaction history
- **Did** - Decentralized identifiers
- **DidConnection** - DIDComm connections
- **CredentialRecord** - Verifiable credential metadata
- **UserDid** - User-to-DID wallet links

See `prisma/schema.prisma` for complete schema.

## Architecture

### Authentication
- Custom authentication using bcryptjs for password hashing
- Session-based auth with HTTP-only cookies
- Role-based access control (RBAC)

### Identus Integration
- **DIDs**: Created using Hyperledger Identus Edge Agent SDK
- **Credentials**: Issued and verified through Identus
- **Connections**: DIDComm protocol for peer-to-peer connections
- **Separation**: Identus handles DID operations, Prisma stores metadata

### Database Strategy
- **Prisma ORM** for type-safe database queries
- **PostgreSQL with Prisma Accelerate** for connection pooling
- **Pure Prisma integration** - no external database clients needed
- Metadata stored in PostgreSQL, actual DIDs/credentials managed by Identus

## Common Issues

### Database Connection Failed

If you see "Database connection failed" error:

1. Verify the DATABASE_URL in `.env` is correct
2. Run `npm run db:generate` to generate Prisma client
3. Run `npm run db:push` to sync schema
4. Check that Prisma Accelerate is accessible

### Prisma Client Not Generated

Run:
```bash
npm run db:generate
```

### Port Already in Use

Change the port:
```bash
PORT=3001 npm run dev
```

## Development

### Database Commands

```bash
# Generate Prisma client
npm run db:generate

# Push schema changes to database
npm run db:push

# Open Prisma Studio (database GUI)
npm run db:studio
```

### Adding New Features

1. Update Prisma schema in `prisma/schema.prisma`
2. Run `npm run db:push` to apply changes
3. Generate types with `npm run db:generate`
4. Create API routes in `app/api/`
5. Build UI components in `components/`

## Documentation

- [DID Wallet Linking Guide](DID_WALLET_LINKING.md)
- [Identus Integration Summary](IDENTUS_INTEGRATION_SUMMARY.md)
- [DIDComm Connection Guide](DIDCOMM_CONNECTION_GUIDE.md)

## License

MIT
```

```markdown file="" isHidden
