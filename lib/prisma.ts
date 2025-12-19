import { PrismaClient } from "@prisma/client"

// Singleton pattern for Prisma client
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

export async function testDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`
    console.log("[v0] Database connection successful")
    return true
  } catch (error) {
    console.error("[v0] Database connection failed:", error)
    return false
  }
}
