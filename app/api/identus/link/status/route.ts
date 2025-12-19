/**
 * GET /api/identus/link/status
 * Check the DID wallet linking status for the authenticated user
 * Returns whether user has a linked DID and connection details
 */

import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/session"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    // 1. Verify user is authenticated
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // 2. Check for linked DID
    const linkedDid = await prisma.userDid.findUnique({
      where: { userId: user.id },
    })

    // 3. If no linked DID, check for pending connections
    if (!linkedDid) {
      const pendingConnection = await prisma.didConnection.findFirst({
        where: {
          userId: user.id,
          state: { in: ["invited", "requested"] },
        },
        orderBy: { createdAt: "desc" },
      })

      if (pendingConnection) {
        return NextResponse.json({
          linked: false,
          state: "pending",
          connectionId: pendingConnection.id,
          connectionState: pendingConnection.state,
        })
      }

      return NextResponse.json({
        linked: false,
        state: "not_linked",
      })
    }

    // 4. User has a linked DID
    return NextResponse.json({
      linked: true,
      state: "linked",
      did: linkedDid.did,
      linkedAt: linkedDid.createdAt,
    })
  } catch (error) {
    console.error("[v0] Failed to check DID link status:", error)
    return NextResponse.json({ error: "Failed to check linking status" }, { status: 500 })
  }
}
