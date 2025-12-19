/**
 * POST /api/identus/link/unlink
 * Unlink a DID wallet from the authenticated user's account
 */

import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/session"
import { prisma } from "@/lib/prisma"

export async function POST() {
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

    if (!linkedDid) {
      return NextResponse.json({ error: "No DID wallet is currently linked" }, { status: 400 })
    }

    console.log("[v0] Unlinking DID:", linkedDid.did)

    // 3. Delete the UserDid link
    await prisma.userDid.delete({
      where: { id: linkedDid.id },
    })

    console.log("[v0] DID wallet successfully unlinked")

    return NextResponse.json({
      success: true,
      message: "DID wallet unlinked successfully",
    })
  } catch (error) {
    console.error("[v0] Failed to unlink DID:", error)
    return NextResponse.json({ error: "Failed to unlink DID wallet" }, { status: 500 })
  }
}
