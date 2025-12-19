import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { userId, type } = await request.json()

    if (!userId || !type) {
      return NextResponse.json({ error: "userId and type are required" }, { status: 400 })
    }

    console.log("[v0] Submitting verification:", { userId, type })

    const verification = await prisma.verification.create({
      data: {
        userId,
        type,
        status: "PENDING",
        documentHash: `0x${Math.random().toString(16).substring(2, 10)}`,
      },
    })

    console.log("[v0] Verification created:", verification.id)

    return NextResponse.json({
      verification: {
        id: verification.id,
        userId: verification.userId,
        type: verification.type,
        status: verification.status,
        createdAt: verification.createdAt.toISOString(),
      },
    })
  } catch (error: any) {
    console.error("[v0] Error submitting verification:", error)
    return NextResponse.json({ error: error.message || "Failed to submit verification" }, { status: 500 })
  }
}
