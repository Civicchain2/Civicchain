# CivicChain Database Integration Guide

This guide demonstrates how to replace mock data with real database connections. CivicChain currently uses localStorage for data persistence, but this guide shows you how to integrate with production databases.

## Overview

The application has several layers that need to be updated for real database integration:

1. **State Management** - Zustand stores that manage data
2. **API Routes** - Next.js backend endpoints
3. **Client Components** - React components that fetch data
4. **Authentication** - User login and registration

---

## 1. Current Mock Data Architecture

### A. State Management (lib/store.ts)

**Current Implementation:**
```typescript
// Using localStorage to persist auth state
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
      isAuthenticated: () => get().user !== null,
    }),
    {
      name: "civicchain-auth", // This persists to localStorage
    },
  ),
)
```

**To Replace with Database:**
- Remove the `persist` middleware
- Use API calls to fetch/store user data
- Keep state for client-side caching only

### B. Registration Flow (components/auth/register-form.tsx)

**Current Mock Implementation:**
```typescript
// Line ~60: Mock localStorage storage
const userData = {
  id: Date.now().toString(), // Random ID
  fullName: formData.fullName,
  email: formData.email,
  role: formData.role,
  nin: formData.nin,
  ninVerified: false,
  cardanoId: cardanoId, // Generated client-side
}
localStorage.setItem("civicchain_user", JSON.stringify(userData))
```

**Replace with Database Call:**
```typescript
// Call your backend API
const response = await fetch("/api/auth/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    fullName: formData.fullName,
    email: formData.email,
    password: formData.password,
    role: formData.role,
    nin: formData.nin,
  }),
})

const userData = await response.json()
// Backend should generate ID, cardanoId, and handle password hashing
useAuthStore.setUser(userData)
```

### C. Login Flow (components/auth/login-form.tsx)

**Current Mock Implementation:**
```typescript
// Line ~50: Gets user from localStorage
const userStr = localStorage.getItem("civicchain_user")
const user = userStr ? JSON.parse(userStr) : null

if (user && user.email === formData.email) {
  // Allow login without password check
}
```

**Replace with Database Call:**
```typescript
const response = await fetch("/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: formData.email,
    password: formData.password,
  }),
})

if (response.ok) {
  const user = await response.json()
  useAuthStore.setUser(user)
  // Redirect based on role
}
```

---

## 2. Database Schema Setup

### A. PostgreSQL / Neon Setup

**Create Users Table:**
```sql
-- Core user information
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('citizen', 'officer', 'auditor')),
  nin VARCHAR(11) UNIQUE NOT NULL,
  nin_verified BOOLEAN DEFAULT FALSE,
  cardano_id VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX idx_email ON users(email);
CREATE INDEX idx_nin ON users(nin);
```

**Create Transactions Table:**
```sql
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('payment', 'refund')),
  description TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('completed', 'pending', 'failed')),
  tx_hash VARCHAR(255) UNIQUE NOT NULL,
  recipient_email VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_transactions ON transactions(user_id);
CREATE INDEX idx_tx_hash ON transactions(tx_hash);
```

**Create Verifications Table:**
```sql
CREATE TABLE verifications (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('verified', 'pending', 'rejected')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  verified_at TIMESTAMP
);
```

**Create Digital Identity Table:**
```sql
CREATE TABLE digital_identities (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  did_uri VARCHAR(255) UNIQUE NOT NULL,
  public_key TEXT NOT NULL,
  verification_score INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE did_credentials (
  id SERIAL PRIMARY KEY,
  identity_id INT NOT NULL REFERENCES digital_identities(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  issuer VARCHAR(255) NOT NULL,
  issued_date TIMESTAMP NOT NULL,
  expiry_date TIMESTAMP,
  verified BOOLEAN DEFAULT FALSE,
  hash VARCHAR(255) UNIQUE NOT NULL
);
```

### B. MongoDB Setup (Alternative)

```javascript
// Users Collection
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "fullName", "passwordHash", "role", "nin"],
      properties: {
        _id: { bsonType: "objectId" },
        email: { bsonType: "string", pattern: "^[^@]+@[^@]+\\.[^@]+$" },
        fullName: { bsonType: "string" },
        passwordHash: { bsonType: "string" },
        role: { enum: ["citizen", "officer", "auditor"] },
        nin: { bsonType: "string", minLength: 11, maxLength: 11 },
        ninVerified: { bsonType: "bool" },
        cardanoId: { bsonType: "string" },
        createdAt: { bsonType: "date" },
      },
    },
  },
})

// Create indexes
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ nin: 1 }, { unique: true })

// Similar collections for transactions, verifications, digital_identities
```

---

## 3. Backend API Routes

### A. Update Registration Route (app/api/auth/register/route.ts)

**Replace Mock Implementation:**
```typescript
import { NextRequest, NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { pool } from "@/lib/database" // Your database connection

export async function POST(request: NextRequest) {
  try {
    const { fullName, email, password, role, nin } = await request.json()

    // Validation
    if (!fullName || !email || !password || !role || !nin) {
      return NextResponse.json(
        { error: "All fields required" },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1 OR nin = $2",
      [email, nin]
    )

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await hash(password, 10)

    // Generate Cardano ID
    const cardanoId = `addr_${Math.random().toString(36).substring(2, 25)}`

    // Insert user into database
    const result = await pool.query(
      `INSERT INTO users 
       (full_name, email, password_hash, role, nin, cardano_id) 
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, full_name, email, role, nin, cardano_id`,
      [fullName, passwordHash, passwordHash, role, nin, cardanoId]
    )

    const user = result.rows[0]

    return NextResponse.json({
      id: user.id.toString(),
      fullName: user.full_name,
      email: user.email,
      role: user.role,
      nin: user.nin,
      cardanoId: user.cardano_id,
      ninVerified: false,
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    )
  }
}
```

**Comments Explaining Database Integration:**
```typescript
// Line 10: Connect to PostgreSQL using pg pool
// - Use: const { Pool } = require("pg")
// - Config: new Pool({ connectionString: process.env.DATABASE_URL })
// - Handles: Connection pooling, query execution

// Line 14-18: Validation layer
// - Always validate on backend for security
// - Check for required fields
// - Validate email format, NIN length

// Line 20-24: Check existing user
// - Use $1, $2 (parameterized queries) to prevent SQL injection
// - Query both email and NIN to prevent duplicates
// - Return early to prevent duplicate registrations

// Line 26-28: Password hashing
// - Never store plain passwords
// - Use bcryptjs or argon2 for secure hashing
// - Higher cost factor = more secure (10+ recommended)

// Line 30-31: Generate Cardano address
// - Could also use Cardano SDK to generate real addresses
// - Store this ID for blockchain transactions

// Line 33-39: Database INSERT
// - Use parameterized queries ($1, $2, etc.)
// - RETURNING clause gets the inserted data
// - Database generates id and timestamps

// Line 44-49: Return response
// - Only return necessary fields (never password hash)
// - Client stores in state/localStorage for session
```

### B. Update Login Route (app/api/auth/login/route.ts)

```typescript
import { NextRequest, NextResponse } from "next/server"
import { compare } from "bcryptjs"
import { pool } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Line 12: Query user by email
    // - Single query to database
    // - Fetch stored password hash for verification
    const result = await pool.query(
      `SELECT id, full_name, email, password_hash, role, nin, cardano_id, nin_verified 
       FROM users WHERE email = $1`,
      [email]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 401 }
      )
    }

    const user = result.rows[0]

    // Line 25: Verify password hash
    // - Use bcryptjs compare() instead of plain comparison
    // - Returns boolean indicating if password matches
    const passwordMatch = await compare(password, user.password_hash)

    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      )
    }

    // Line 33: Return user data (exclude password)
    // - Create JWT token here for stateless auth (optional)
    // - Set HTTP-only cookie for token storage (secure)
    return NextResponse.json({
      id: user.id.toString(),
      fullName: user.full_name,
      email: user.email,
      role: user.role,
      nin: user.nin,
      cardanoId: user.cardano_id,
      ninVerified: user.nin_verified,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    )
  }
}
```

### C. Add Transaction Endpoint (app/api/transactions/route.ts)

```typescript
import { NextRequest, NextResponse } from "next/server"
import { pool } from "@/lib/database"
import { getUserFromToken } from "@/lib/auth" // Auth middleware

export async function POST(request: NextRequest) {
  try {
    // Line 7: Extract user from JWT token
    // - Middleware validates token before reaching this code
    // - Prevents unauthorized transaction creation
    const user = await getUserFromToken(request)

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { type, description, amount, status, recipientEmail } = await request.json()

    // Line 22: Generate transaction hash
    // - In production: would be Cardano blockchain tx hash
    // - Here: mock hash for demonstration
    const txHash = `tx_${Date.now()}_${Math.random().toString(36).substring(7)}`

    // Line 27: Insert transaction into database
    // - Link to user_id for data isolation
    // - Store all transaction details
    const result = await pool.query(
      `INSERT INTO transactions 
       (user_id, type, description, amount, status, tx_hash, recipient_email)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, type, description, amount, status, tx_hash, created_at`,
      [user.id, type, description, amount, status, txHash, recipientEmail]
    )

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("Transaction error:", error)
    return NextResponse.json(
      { error: "Transaction failed" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Line 47: Extract user from token
    const user = await getUserFromToken(request)

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Line 57: Query transactions for specific user
    // - Filter by user_id to prevent data leakage
    // - Order by date descending for latest first
    const result = await pool.query(
      `SELECT * FROM transactions 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 50`,
      [user.id]
    )

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Fetch transactions error:", error)
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    )
  }
}
```

---

## 4. Environment Variables

**Add to .env.local:**
```bash
# PostgreSQL Connection
DATABASE_URL=postgresql://user:password@localhost:5432/civicchain

# MongoDB Connection (if using MongoDB)
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/civicchain

# JWT Secret for token signing
JWT_SECRET=your-secret-key-here

# Cardano Configuration
CARDANO_NETWORK=testnet
CARDANO_ENDPOINT=https://testnet-cardano-ogmios.demeter.run

# Verification Service
VERIFICATION_SERVICE_API_KEY=your-api-key
```

---

## 5. Client-Side Integration

### A. Update Payment Form (components/citizen/payment-form.tsx)

**Replace mock API call (Line ~70):**

**Before (Mock):**
```typescript
const response = await fetch("/api/transactions", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    type: "payment",
    description: validatedData.description,
    amount: `₦ ${Number.parseFloat(validatedData.amount).toLocaleString()}`,
    status: "completed", // Always completed in mock
  }),
})
```

**After (Real Database):**
```typescript
// Line 70: Send complete data with user context
const response = await fetch("/api/transactions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    // Line 73: Include auth token in header
    // - Backend validates token to identify user
    // - Prevents users from creating transactions for others
    "Authorization": `Bearer ${localStorage.getItem("token")}`,
  },
  body: JSON.stringify({
    type: "payment",
    description: validatedData.description,
    amount: validatedData.amount, // Send as number, not formatted string
    status: "pending", // Set to pending until blockchain confirms
    recipientEmail: validatedData.recipientEmail,
    // Line 81: Additional fields for real transactions
    // - paymentType: for payment categorization
    // - metadata: for additional transaction details
  }),
})

// Line 84: Handle response with error checking
if (!response.ok) {
  const error = await response.json()
  throw new Error(error.message)
}

const transaction = await response.json()
// Line 89: Transaction now has real database ID
// - Use transaction.id for references, not client-side ID
// - tx_hash is from Cardano blockchain (real or mock)
```

### B. Fetch User Dashboards

**Update Dashboard Page (app/citizen/dashboard/page.tsx):**

**Before (Mock - Line ~20):**
```typescript
const userStr = localStorage.getItem("civicchain_user")
if (!userStr) {
  router.push("/login")
  return
}
const userData = JSON.parse(userStr)
```

**After (Real Database):**
```typescript
// Line 20: Fetch user data from API
// - Don't trust client localStorage for user data
// - Always verify with backend
useEffect(() => {
  const fetchUser = async () => {
    // Line 24: Get token from localStorage
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    // Line 29: Fetch user profile from API
    const response = await fetch("/api/auth/me", {
      headers: {
        "Authorization": `Bearer ${token}`,
        // Line 33: Backend uses token to identify user
        // - Decodes JWT and retrieves user from database
        // - Returns fresh user data (latest nin_verified, etc.)
      },
    })

    if (!response.ok) {
      localStorage.removeItem("token")
      router.push("/login")
      return
    }

    const user = await response.json()
    // Line 43: Validate user role matches dashboard
    if (user.role !== "citizen") {
      router.push("/login")
      return
    }

    setUser(user)
  }

  fetchUser()
}, [router])
```

---

## 6. Testing Database Integration

### A. Test User Registration

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123",
    "role": "citizen",
    "nin": "12345678901"
  }'
```

### B. Test User Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

### C. Test Transaction Creation

```bash
curl -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "type": "payment",
    "description": "Civic License Renewal",
    "amount": "5000",
    "recipientEmail": "officer@example.com"
  }'
```

---

## 7. Security Checklist

- [ ] Never store passwords in plain text
- [ ] Use parameterized queries to prevent SQL injection
- [ ] Implement JWT tokens for stateless auth
- [ ] Use HTTPS in production
- [ ] Validate all inputs on backend (not just client)
- [ ] Implement rate limiting on auth endpoints
- [ ] Store sensitive data in environment variables
- [ ] Use HTTP-only cookies for token storage
- [ ] Implement CORS properly
- [ ] Add logging for audit trails

---

## 8. Common Integrations

### PostgreSQL / Neon
```typescript
// lib/database.ts
import { Pool } from "pg"

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err)
})
```

### MongoDB
```typescript
import { MongoClient } from "mongodb"

const client = new MongoClient(process.env.MONGODB_URI)
export async function connect() {
  await client.connect()
  return client.db("civicchain")
}
```

### Supabase
```typescript
import { createClient } from "@supabase/supabase-js"

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)
```

---

## Summary

To implement real database integration:

1. **Create database schema** with users, transactions, verifications tables
2. **Update API routes** with database queries and validation
3. **Replace localStorage** with API calls
4. **Hash passwords** using bcryptjs
5. **Implement JWT tokens** for authentication
6. **Add error handling** and logging
7. **Test thoroughly** with multiple scenarios
8. **Follow security best practices** listed in checklist

Each line change is marked with `// Line X:` comments in the code examples above.
