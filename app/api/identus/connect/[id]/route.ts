/**
 * API Route: Get Connection Status
 *
 * This endpoint allows the frontend to poll for connection state updates.
 * The frontend can call this repeatedly to check if the holder has scanned
 * the QR code and completed the connection.
 *
 * States:
 * - invitation: QR code created, waiting for holder to scan
 * - request_received: Holder scanned, backend received connection request
 * - active: Connection fully established
 * - error: Something went wrong
 */

import { type NextRequest, NextResponse } from "next/server"
import { getConnectionById } from "@/lib/identus/connection-manager"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const connectionId = params.id

    console.log("[v0] Checking connection status:", connectionId)

    // Get current connection state from database
    const connection = await getConnectionById(connectionId)

    if (!connection) {
      return NextResponse.json({ error: "Connection not found" }, { status: 404 })
    }

    // Return current state to frontend
    return NextResponse.json({
      connectionId: connection.id,
      state: connection.state,
      role: connection.role,
      theirDid: connection.their_did,
      myDid: connection.my_did,
      createdAt: connection.created_at,
      updatedAt: connection.updated_at,
      metadata: connection.metadata,
    })
  } catch (error) {
    console.error("[v0] Connection status error:", error)
    return NextResponse.json(
      {
        error: "Failed to get connection status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
