/**
 * API Route: Verify a Verifiable Credential
 * This checks if a credential is valid and hasn't been tampered with
 */

import { type NextRequest, NextResponse } from "next/server"
import { getIdentusAgent } from "@/lib/identus/agent"

export async function POST(request: NextRequest) {
  try {
    const { credential } = await request.json()

    if (!credential) {
      return NextResponse.json({ error: "credential is required" }, { status: 400 })
    }

    console.log("[v0] Verifying credential")

    // Get the server-side Identus Agent
    const agent = await getIdentusAgent()

    // Verify the credential signature and validity
    // This checks:
    // 1. The credential signature is valid
    // 2. The issuer DID is valid
    // 3. The credential hasn't expired
    // 4. The credential hasn't been revoked (if revocation is implemented)
    const isValid = await agent.verifyCredential(credential)

    console.log("[v0] Credential verification result:", isValid)

    return NextResponse.json({
      isValid,
      credential: {
        type: credential.type,
        issuer: credential.issuer,
        subject: credential.credentialSubject?.id,
      },
      status: isValid ? "valid" : "invalid",
      message: isValid ? "Credential is valid" : "Credential verification failed",
    })
  } catch (error) {
    console.error("[v0] Credential verification error:", error)
    return NextResponse.json(
      {
        isValid: false,
        error: "Failed to verify credential",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
