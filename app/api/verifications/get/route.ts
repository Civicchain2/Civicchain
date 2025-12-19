import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    console.log("[v0] Fetching verifications for user:", userId)

    const verifications = await prisma.verification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    })

    console.log("[v0] Found verifications:", verifications.length)

    // Format the response to match frontend expectations
    const formatted = verifications.map((v) => ({
      id: v.id,
      userId: v.userId,
      type: v.type,
      status: v.status.toLowerCase(), // "PENDING" -> "pending"
      document_hash: v.documentHash || "",
      created_at: v.createdAt.toISOString(),
    }))

    return NextResponse.json({ verifications: formatted })
  } catch (error: any) {
    console.error("[v0] Error fetching verifications:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch verifications" }, { status: 500 })
  }
}
