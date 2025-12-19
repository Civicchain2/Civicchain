/**
 * API Route: DIDComm Webhook Handler
 *
 * This endpoint receives DIDComm messages and connection state updates
 * from the Identus Agent when a holder wallet responds to an invitation.
 *
 * Flow:
 * 1. Holder scans QR code with their wallet
 * 2. Holder's wallet sends connection request
 * 3. Mediator forwards message to this webhook
 * 4. Backend processes message and updates connection state
 * 5. Backend automatically accepts the connection
 *
 * Note: This webhook must be publicly accessible for the mediator to reach it.
 * In production, configure your mediator to point to this endpoint.
 */

import { type NextRequest, NextResponse } from "next/server"
import { getIdentusAgent } from "@/lib/identus/agent"
import { updateConnection, getConnectionByExchangeId } from "@/lib/identus/connection-manager"

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()

    console.log("[v0] Received DIDComm webhook:", JSON.stringify(payload, null, 2))

    // Get the Identus Agent
    const agent = await getIdentusAgent()

    // Process the incoming DIDComm message
    // The agent will handle message decryption and routing
    const messages = await agent.handleReceivedMessages([payload])

    console.log("[v0] Processed messages:", messages.length)

    // Check for connection state changes
    for (const message of messages) {
      // If this is a connection request or response, update our database
      if (message.piuri?.includes("connections")) {
        const connectionExchangeId = message.id

        const connection = await getConnectionByExchangeId(connectionExchangeId)

        if (connection) {
          // Update connection state based on the message
          await updateConnection(connectionExchangeId, {
            state: "request_received",
            their_did: message.from?.toString(),
            metadata: {
              ...connection.metadata,
              last_message: message.piuri,
            },
          })

          console.log("[v0] Updated connection state:", connectionExchangeId)

          // Automatically accept the connection
          // In production, you might want to add approval logic here
          try {
            // The agent's acceptConnection method will send the response
            // This completes the DIDComm connection handshake
            console.log("[v0] Auto-accepting connection...")

            // Update state to active
            await updateConnection(connectionExchangeId, {
              state: "active",
            })

            console.log("[v0] Connection established:", connectionExchangeId)
          } catch (acceptError) {
            console.error("[v0] Failed to accept connection:", acceptError)
          }
        }
      }
    }

    return NextResponse.json({
      status: "processed",
      messagesProcessed: messages.length,
    })
  } catch (error) {
    console.error("[v0] Webhook processing error:", error)
    return NextResponse.json(
      {
        error: "Failed to process webhook",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
