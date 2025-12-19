/**
 * Connection Manager for DIDComm connections
 * Handles server-side connection state and database persistence
 * BACKEND ONLY - Never import in client components
 */

import { prisma } from "@/lib/prisma"

export interface Connection {
  id: string
  connectionId: string
  userId: string | null
  state: string
  theirDid: string | null
  invitation: string | null
  createdAt: Date
  updatedAt: Date
}

/**
 * Save a new connection to the database
 */
export async function saveConnection(connection: {
  connectionId: string
  userId?: string | null
  state?: string
  theirDid?: string | null
  invitation?: string | null
}): Promise<Connection> {
  try {
    const data = await prisma.didConnection.create({
      data: {
        connectionId: connection.connectionId,
        userId: connection.userId || null,
        state: connection.state || "invited",
        theirDid: connection.theirDid || null,
        invitation: connection.invitation || null,
      },
    })

    return data as Connection
  } catch (error) {
    console.error("[v0] Failed to save connection:", error)
    throw new Error(`Failed to save connection: ${error}`)
  }
}

/**
 * Update an existing connection
 */
export async function updateConnection(
  connectionId: string,
  updates: {
    userId?: string | null
    state?: string
    theirDid?: string | null
    invitation?: string | null
  },
): Promise<Connection> {
  try {
    const data = await prisma.didConnection.update({
      where: { connectionId },
      data: {
        ...updates,
        updatedAt: new Date(),
      },
    })

    return data as Connection
  } catch (error) {
    console.error("[v0] Failed to update connection:", error)
    throw new Error(`Failed to update connection: ${error}`)
  }
}

/**
 * Get a connection by its exchange ID
 */
export async function getConnectionByExchangeId(exchangeId: string): Promise<Connection | null> {
  try {
    const data = await prisma.didConnection.findUnique({
      where: { connectionId: exchangeId },
    })

    return data as Connection | null
  } catch (error) {
    console.error("[v0] Failed to get connection:", error)
    throw new Error(`Failed to get connection: ${error}`)
  }
}

/**
 * Get connection by database ID
 */
export async function getConnectionById(id: string): Promise<Connection | null> {
  try {
    const data = await prisma.didConnection.findUnique({
      where: { id },
    })

    return data as Connection | null
  } catch (error) {
    console.error("[v0] Failed to get connection:", error)
    throw new Error(`Failed to get connection: ${error}`)
  }
}

/**
 * List all connections for a user
 */
export async function listConnectionsForUser(userId: string): Promise<Connection[]> {
  try {
    const data = await prisma.didConnection.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    })

    return data as Connection[]
  } catch (error) {
    console.error("[v0] Failed to list connections:", error)
    throw new Error(`Failed to list connections: ${error}`)
  }
}
