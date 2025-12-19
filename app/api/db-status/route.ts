import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const checks = {
    envSet: false,
    canConnect: false,
    tablesExist: false,
    error: null as string | null,
    details: {} as any,
  }

  try {
    // Check 1: Environment variable
    checks.envSet = !!process.env.DATABASE_URL
    checks.details.databaseUrl = process.env.DATABASE_URL ? "Set (hidden)" : "Not set"

    if (!checks.envSet) {
      return NextResponse.json(checks, { status: 500 })
    }

    // Check 2: Database connection
    await prisma.$connect()
    checks.canConnect = true

    // Check 3: Check if User table exists by attempting a simple query
    try {
      const userCount = await prisma.user.count()
      checks.tablesExist = true
      checks.details.userCount = userCount
      checks.details.message = "Database is properly configured and tables exist"
    } catch (tableError: any) {
      checks.tablesExist = false
      checks.error = `Tables missing: ${tableError.message}`
      checks.details.solution = "Run: npx prisma db push"
    }

    await prisma.$disconnect()
  } catch (error: any) {
    checks.error = error.message
    checks.details.errorCode = error.code
    checks.details.errorType = error.constructor.name
  }

  const status = checks.tablesExist ? 200 : 500
  return NextResponse.json(checks, { status })
}
