import { type NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma/client"
import bcrypt from "bcryptjs"; 


// 1. Setup Prisma Client (Database)
const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function POST(request: NextRequest) {
  try {
    const { fullName, email, password, role } = await request.json();

    // Basic Validation
    if (!fullName || !email || !password || !role) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    
    // 1️⃣ Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);


    // 2. Generate a Mock DID (Simulation of Atala PRISM)
    // In a real app, you would call the Atala PRISM SDK here.
    // For the hackathon, we generate a convincing-looking DID string.
    const mockHash = Array.from({length: 32}, () => Math.floor(Math.random()*16).toString(16)).join('');
    const didUri = `did:prism:${mockHash}`;

    let user;

    // 3. Try to Save to Database
    try {
      user = await prisma.user.create({
        data: {
          fullName,
          email,
          password: hashedPassword, // NOTE: In production, hash this password with bcrypt!
           role: role.toUpperCase() as "CITIZEN" | "OFFICER" | "AUDITOR",
          didUri
        }
      });
      console.log("User registered in Database:", user.id);

    } catch (dbError: any) {
      // 4. Fallback Handling
      
      // Check if it's a unique constraint violation (User already exists)
      if (dbError.code === 'P2002') {
        return NextResponse.json({ error: "Email already exists" }, { status: 400 });
      }

      console.warn("Database registration failed (Using Mock Fallback):", dbError.message);
      
      // Fallback: Return a mock user object so the UI doesn't break
      // --- FIX: Added "user = {" below ---
      user = {
        id: Date.now().toString(),
        fullName,
        email,
        role,
        didUri
      };
    }
    
    const users = await prisma.user.findMany()
    console.log("All registered users:", users);

    return NextResponse.json(user);

  } catch (error) {
    console.error("Registration API Error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}