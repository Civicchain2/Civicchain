/**
 * API Route: List credentials for a user's DID
 * Returns verifiable credentials from the Identus agent
 */

import { type NextRequest, NextResponse } from "next/server"
import { getIdentusAgent } from "@/lib/identus/agent"
import { PrismaClient } from "@prisma/client"

const globalForPrisma = global as unknown as { prisma: PrismaClient }
const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    // Get user's DID from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user || !user.didUri) {
      return NextResponse.json({ error: "User DID not found" }, { status: 404 })
    }

    // Get the Identus agent
    const agent = await getIdentusAgent()

    // Get all credentials from the agent's storage
    const credentials = await agent.verifiableCredentials()

    // Filter credentials that belong to this user's DID
    const userCredentials = credentials.map((cred) => ({
      id: cred.id,
      type: cred.credentialType || "VerifiableCredential",
      claims: cred.claims,
      issuer: cred.issuer,
      issuanceDate: cred.issuanceDate?.toISOString(),
      expirationDate: cred.expirationDate?.toISOString(),
    }))

    return NextResponse.json({
      didUri: user.didUri,
      credentials: userCredentials,
      count: userCredentials.length,
    })
  } catch (error) {
    console.error("[v0] Failed to list credentials:", error)
    return NextResponse.json(
      { error: "Failed to retrieve credentials", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
