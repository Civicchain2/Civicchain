/**
 * POST /api/identus/link/complete
 * Complete the DID wallet linking process
 * Called after DIDComm connection reaches 'completed' state
 * Links the resolved DID to the authenticated user's account
 */

import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/session"
import { getConnectionById } from "@/lib/identus/connection-manager"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    console.log("[v0] Completing DID wallet linking")

    // 1. Verify user is authenticated
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // 2. Get connection ID from request
    const { connectionId } = await request.json()
    if (!connectionId) {
      return NextResponse.json({ error: "Connection ID is required" }, { status: 400 })
    }

    console.log("[v0] Looking up connection:", connectionId)

    // 3. Get the connection from database
    const connection = await getConnectionById(connectionId)
    if (!connection) {
      return NextResponse.json({ error: "Connection not found" }, { status: 404 })
    }

    // 4. Verify connection belongs to the current user
    if (connection.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized: Connection does not belong to this user" }, { status: 403 })
    }

    // 5. Verify connection is in completed state
    if (connection.state !== "completed") {
      return NextResponse.json(
        { error: `Connection is not ready. Current state: ${connection.state}` },
        { status: 400 },
      )
    }

    // 6. Verify we have a resolved DID
    if (!connection.theirDid) {
      return NextResponse.json({ error: "No DID resolved from connection" }, { status: 400 })
    }

    console.log("[v0] Connection verified, DID:", connection.theirDid)

    // 7. Check if DID is already linked to another user
    const existingDidLink = await prisma.userDid.findUnique({
      where: { did: connection.theirDid },
    })

    if (existingDidLink && existingDidLink.userId !== user.id) {
      return NextResponse.json({ error: "This DID is already linked to another account" }, { status: 400 })
    }

    // 8. Check if user already has a linked DID
    const existingUserLink = await prisma.userDid.findUnique({
      where: { userId: user.id },
    })

    if (existingUserLink) {
      return NextResponse.json({ error: "You already have a DID wallet linked" }, { status: 400 })
    }

    console.log("[v0] Creating UserDid link")

    // 9. Create the UserDid link
    const userDid = await prisma.userDid.create({
      data: {
        userId: user.id,
        did: connection.theirDid,
      },
    })

    console.log("[v0] DID wallet successfully linked:", userDid.id)

    return NextResponse.json({
      success: true,
      did: connection.theirDid,
      linkedAt: userDid.createdAt,
    })
  } catch (error) {
    console.error("[v0] Failed to complete DID linking:", error)
    return NextResponse.json(
      {
        error: "Failed to complete DID linking",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
