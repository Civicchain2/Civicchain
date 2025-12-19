/**
 * API Route: Create a new PRISM DID
 * This creates a decentralized identifier anchored to Cardano
 */

import { type NextRequest, NextResponse } from "next/server"
import { getIdentusAgent } from "@/lib/identus/agent"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    console.log("[v0] Creating PRISM DID for user:", userId)

    // Get the server-side Identus Agent
    const agent = await getIdentusAgent()

    // Create a new PRISM DID
    // This DID will be anchored to the Cardano blockchain
    const did = await agent.createNewPrismDID(
      "master0", // Alias for the DID
      [], // Services (optional, can add DIDComm endpoints later)
    )

    console.log("[v0] Created PRISM DID:", did.toString())

    // In production, store this DID in your database linked to the userId
    // For now, return it to the client
    return NextResponse.json({
      did: did.toString(),
      userId,
      status: "created",
      message: "PRISM DID created successfully",
    })
  } catch (error) {
    console.error("[v0] DID creation error:", error)
    return NextResponse.json(
      { error: "Failed to create DID", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
