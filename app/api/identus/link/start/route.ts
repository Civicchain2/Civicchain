/**
 * POST /api/identus/link/start
 * Start the DID wallet linking process for an authenticated user
 * Creates a DIDComm connection invitation and associates it with the user
 */

import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/session"
import { getIdentusAgent } from "@/lib/identus/agent"
import { saveConnection } from "@/lib/identus/connection-manager"
import { prisma } from "@/lib/prisma"

export async function POST() {
  try {
    console.log("[v0] Starting DID wallet linking process")

    // 1. Verify user is authenticated
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Authentication required. Please log in first." }, { status: 401 })
    }

    console.log("[v0] User authenticated:", user.id)

    const existingUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { didUri: true },
    })

    if (existingUser?.didUri) {
      return NextResponse.json({ error: "You already have a DID wallet linked to your account." }, { status: 400 })
    }

    console.log("[v0] No existing DID link found, proceeding with connection")

    // 3. Create a new DIDComm connection invitation using Identus Agent
    const agent = await getIdentusAgent()
    const invitation = await agent.createNewPeerDIDConnection()

    console.log("[v0] DIDComm invitation created")

    // 4. Save the connection to database with user association
    const connection = await saveConnection({
      connectionId: invitation.connectionId,
      userId: user.id,
      state: "invited",
      invitation: JSON.stringify(invitation),
    })

    console.log("[v0] Connection saved to database:", connection.id)

    // 5. Return the invitation URL for QR code or deep link
    return NextResponse.json({
      success: true,
      connectionId: connection.id,
      invitation: invitation.invitationUrl,
      state: "invited",
    })
  } catch (error) {
    console.error("[v0] Failed to start DID linking:", error)
    return NextResponse.json(
      {
        error: "Failed to start DID linking process. Please try again.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
