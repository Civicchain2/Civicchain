import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        {
          status: "error",
          message: "DATABASE_URL environment variable is not set",
        },
        { status: 500 },
      )
    }

    // Try to import Prisma
    let prismaImportError = null
    let prismaClient = null

    try {
      const { prisma } = await import("@/lib/prisma")
      prismaClient = prisma
    } catch (error: any) {
      prismaImportError = error.message
    }

    if (prismaImportError) {
      return NextResponse.json(
        {
          status: "error",
          message: "Failed to import Prisma client",
          error: prismaImportError,
          suggestion: "Run 'npm run db:generate' to generate the Prisma client",
        },
        { status: 500 },
      )
    }

    // Try to connect to database
    try {
      await prismaClient.$queryRaw`SELECT 1 as test`

      return NextResponse.json({
        status: "success",
        message: "Database connection successful",
        database: "connected",
        prismaClient: "loaded",
        timestamp: new Date().toISOString(),
      })
    } catch (dbError: any) {
      return NextResponse.json(
        {
          status: "error",
          message: "Database connection failed",
          error: dbError.message,
          code: dbError.code,
          suggestion: "Check your DATABASE_URL and ensure the database is accessible",
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message: "Unexpected error during database test",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
