import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth/session"

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "officer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const verifications = await prisma.verification.findMany({
      where: { status: "pending" },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            did: true,
          },
        },
      },
      orderBy: { submittedAt: "desc" },
    })

    return NextResponse.json(verifications)
  } catch (error) {
    console.error("[v0] Failed to fetch verifications:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
