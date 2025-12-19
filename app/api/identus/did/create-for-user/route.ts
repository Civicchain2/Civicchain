import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getIdentusAgent } from "@/lib/identus/agent"

const globalForPrisma = global as unknown as { prisma: PrismaClient }
const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

/**
 * Create a PRISM DID for a user who doesn't have one yet
 * This can be called asynchronously after registration
 */
export async function POST(request: NextRequest) {
  console.log("[v0] Create DID for user request received")

  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if user already has a DID
    if (user.didUri) {
      return NextResponse.json({ didUri: user.didUri }, { status: 200 })
    }

    try {
      console.log("[v0] Creating PRISM DID for user:", userId)
      const agent = await getIdentusAgent()

      const alias = `${user.email.split("@")[0]}-${Date.now()}`
      const result = await agent.createNewPrismDID(alias, [])

      const didUri = result.did
      console.log("[v0] PRISM DID created:", didUri)

      // Update user with new DID
      await prisma.user.update({
        where: { id: userId },
        data: { didUri },
      })

      return NextResponse.json({ didUri }, { status: 201 })
    } catch (didError: any) {
      console.error("[v0] Failed to create PRISM DID:", didError)
      return NextResponse.json(
        {
          error: "Failed to create digital identity. Please ensure Identus Cloud Agent is running.",
          details: didError.message,
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("[v0] Create DID API Error:", error)
    return NextResponse.json({ error: error.message || "DID creation failed" }, { status: 500 })
  }
}
