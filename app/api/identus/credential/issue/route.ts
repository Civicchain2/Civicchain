/**
 * API Route: Issue a Verifiable Credential
 * This allows authorized issuers to create credentials for subjects
 */

import { type NextRequest, NextResponse } from "next/server"
import { getIdentusAgent } from "@/lib/identus/agent"

export async function POST(request: NextRequest) {
  try {
    const { issuerDID, subjectDID, credentialType, claims } = await request.json()

    // Validate required fields
    if (!issuerDID || !subjectDID || !credentialType || !claims) {
      return NextResponse.json(
        { error: "issuerDID, subjectDID, credentialType, and claims are required" },
        { status: 400 },
      )
    }

    console.log("[v0] Issuing credential:", { issuerDID, subjectDID, credentialType })

    // Get the server-side Identus Agent
    const agent = await getIdentusAgent()

    // Create credential subject data
    const credentialSubject = {
      id: subjectDID,
      ...claims,
    }

    // Issue the Verifiable Credential
    // This creates a signed credential that can be verified later
    const credential = await agent.issueCredential({
      type: [credentialType],
      issuer: issuerDID,
      credentialSubject,
      // Optional: Add expiration date
      // expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    })

    console.log("[v0] Credential issued successfully")

    // In production, store the credential hash on-chain and the credential in your database
    return NextResponse.json({
      credential,
      status: "issued",
      message: "Verifiable Credential issued successfully",
    })
  } catch (error) {
    console.error("[v0] Credential issuance error:", error)
    return NextResponse.json(
      { error: "Failed to issue credential", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
