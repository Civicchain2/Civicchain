import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth/session"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const user = await getCurrentUser()

    if (!user || user.role !== "officer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const verification = await prisma.verification.update({
      where: { id },
      data: {
        status: "approved",
        reviewedAt: new Date(),
      },
    })

    return NextResponse.json(verification)
  } catch (error) {
    console.error("[v0] Failed to approve verification:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
