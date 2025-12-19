import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    console.log("[v0] Login attempt for:", email)

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 })
    }

    await prisma.$connect()

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    console.log("[v0] Login successful for user:", user.id)

    // Return the user profile (excluding sensitive password)
    const { password: _, ...userProfile } = user

    return NextResponse.json({
      ...userProfile,
      role: userProfile.role.toLowerCase(),
    })
  } catch (error: any) {
    console.error("[v0] Authentication error:", error)
    return NextResponse.json(
      {
        error: "Authentication failed",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
