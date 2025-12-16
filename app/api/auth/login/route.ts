import { type NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma/client"

// 1. Initialize Prisma Client (Database Connection)
const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    let user;

    try {
      // 2. REAL PATH: Try to find the user in the Database
      // This will work once you paste the DATABASE_URL tomorrow
      user = await prisma.user.findUnique({
        where: { email },
      });

      // Simple password check (Note: In production, use bcrypt/argon2)
      if (user && user.password !== password) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }

    } catch (dbError) {
      console.warn("Database login failed (Using Fallback):", dbError);
      
      // 3. FALLBACK PATH: If DB is down, allow "demo" login
      // This ensures your hackathon demo never completely fails
      if (email.includes("demo")) {
        user = {
          id: "mock-user-id",
          fullName: "Demo Citizen",
          email: email,
          role: "citizen",
          didUri: "did:prism:mock-identity-123"
        };
      }
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 4. Return the user profile (excluding sensitive password)
    const { password: _, ...userProfile } = user as any;
    
    return NextResponse.json(userProfile);

  } catch (error) {
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}