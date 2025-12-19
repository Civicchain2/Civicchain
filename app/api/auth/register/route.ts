import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fullName, email, password, role, nin } = body

    console.log("[v0] Registration request received:", { email, role, hasNin: !!nin })

    // Basic Validation
    if (!fullName || !email || !password || !role) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 })
    }

    if (nin && nin.length !== 11) {
      return NextResponse.json({ error: "NIN must be 11 digits" }, { status: 400 })
    }

    if (!process.env.DATABASE_URL) {
      console.error("[v0] DATABASE_URL is not configured")
      return NextResponse.json(
        {
          error: "Database not configured",
          details: "DATABASE_URL environment variable is missing",
        },
        { status: 500 },
      )
    }

    try {
      await prisma.$queryRaw`SELECT 1`
      console.log("[v0] Database connection test passed")
    } catch (connError: any) {
      console.error("[v0] Database connection test failed:", connError)
      return NextResponse.json(
        {
          error: "Database connection failed",
          details: "Cannot connect to database. Please verify DATABASE_URL is correct and database is accessible.",
          dbError: connError.message,
        },
        { status: 500 },
      )
    }

    console.log("[v0] Hashing password...")
    const hashedPassword = await bcrypt.hash(password, 10)
    console.log("[v0] Password hashed successfully")

    let user

    try {
      console.log("[v0] Creating user in database...")

      user = await prisma.user.create({
        data: {
          fullName,
          email,
          password: hashedPassword,
          role: role.toUpperCase() as "CITIZEN" | "OFFICER" | "AUDITOR",
          nin: nin || null,
          didUri: null,
        },
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          didUri: true,
          createdAt: true,
        },
      })

      console.log("[v0] User created successfully:", user.id)
    } catch (dbError: any) {
      console.error("[v0] Database error:", {
        name: dbError.name,
        code: dbError.code,
        message: dbError.message,
        meta: dbError.meta,
      })

      // Check if it's a unique constraint violation
      if (dbError.code === "P2002") {
        return NextResponse.json({ error: "Email already exists" }, { status: 400 })
      }

      if (dbError.code === "P2021" || dbError.message?.includes("does not exist")) {
        return NextResponse.json(
          {
            error: "Database schema not initialized",
            details:
              "The database tables have not been created. Please run 'npx prisma db push' or check the deployment guide.",
            code: dbError.code,
          },
          { status: 500 },
        )
      }

      // Return a proper JSON error response
      return NextResponse.json(
        {
          error: "Database error",
          details: dbError.message || "Failed to create user",
          code: dbError.code,
        },
        { status: 500 },
      )
    }

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role.toLowerCase(),
          didUri: user.didUri,
          createdAt: user.createdAt,
        },
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error("[v0] Registration API error:", error)

    return NextResponse.json(
      {
        error: "Registration failed",
        details: error.message || "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
