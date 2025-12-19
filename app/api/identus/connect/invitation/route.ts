/**
 * API Route: Create DIDComm Out-of-Band Invitation
 *
 * This endpoint creates a DIDComm invitation that can be scanned by an external
 * Identus-compatible wallet. The invitation establishes a secure connection between
 * the backend agent and the holder's wallet.
 *
 * Flow:
 * 1. Backend creates a peer DID for this connection
 * 2. Backend generates an out-of-band invitation with the peer DID
 * 3. Invitation is encoded as URL and QR-friendly JSON
 * 4. Connection state is saved to database
 * 5. Frontend displays QR code for holder to scan
 */

import { type NextRequest, NextResponse } from "next/server"
import { getIdentusAgent } from "@/lib/identus/agent"
import { saveConnection } from "@/lib/identus/connection-manager"

export async function POST(request: NextRequest) {
  try {
    const { userId, label } = await request.json()

    console.log("[v0] Creating DIDComm invitation for user:", userId)

    // Get the Identus Agent (backend only)
    const agent = await getIdentusAgent()

    // Create a peer DID for this connection
    // Peer DIDs are lightweight DIDs suitable for pairwise connections
    const peerDID = await agent.createNewPeerDID(
      [], // Services array - the agent handles DIDComm services automatically
      true, // updateMediator - register this DID with the mediator
    )

    console.log("[v0] Created peer DID for connection:", peerDID.toString())

    // Create an out-of-band invitation
    // This invitation can be encoded as a URL or QR code
    const invitation = await agent.createOutOfBandInvitation({
      from: peerDID,
      label: label || "CivicChain Platform",
      // The mediator handles routing automatically
    })

    console.log("[v0] Created out-of-band invitation")

    // Generate invitation URL for QR code
    // This URL follows the DIDComm OOB invitation spec
    const invitationUrl = invitation.toUrl()

    // Get the raw invitation payload (JSON)
    const invitationPayload = invitation.toJSON()

    // Generate a unique identifier for this connection exchange
    const connectionExchangeId = `conn_${Date.now()}_${Math.random().toString(36).substring(7)}`

    // Save connection state to database
    const connection = await saveConnection({
      connection_exchange_id: connectionExchangeId,
      user_id: userId,
      invitation_url: invitationUrl,
      invitation_payload: invitationPayload,
      state: "invitation",
      role: "inviter",
      my_did: peerDID.toString(),
      metadata: { label },
    })

    console.log("[v0] Saved connection to database:", connection.id)

    // Return invitation data to frontend
    return NextResponse.json({
      connectionId: connection.id,
      connectionExchangeId: connectionExchangeId,
      invitationUrl: invitationUrl,
      invitationPayload: invitationPayload,
      qrData: invitationUrl, // Use the URL directly for QR code
      status: "invitation_created",
      message: "Scan this QR code with your Identus wallet to connect",
    })
  } catch (error) {
    console.error("[v0] Connection invitation error:", error)
    return NextResponse.json(
      {
        error: "Failed to create connection invitation",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
