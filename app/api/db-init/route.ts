import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] Database initialization check started")

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

    // Test basic connection
    console.log("[v0] Testing database connection...")
    try {
      await prisma.$queryRaw`SELECT 1 as test`
      console.log("[v0] Database connection successful")
    } catch (connError: any) {
      return NextResponse.json(
        {
          status: "error",
          message: "Cannot connect to database",
          details: connError.message,
        },
        { status: 500 },
      )
    }

    // Check if User table exists
    console.log("[v0] Checking if tables exist...")
    try {
      const userCount = await prisma.user.count()
      console.log("[v0] User table exists, count:", userCount)

      return NextResponse.json({
        status: "success",
        message: "Database is properly initialized",
        tables: {
          users: userCount,
        },
        databaseUrl: process.env.DATABASE_URL?.substring(0, 30) + "...",
      })
    } catch (tableError: any) {
      console.error("[v0] Table check failed:", tableError)

      return NextResponse.json(
        {
          status: "error",
          message: "Database tables not initialized",
          details: "The schema has not been pushed to the database. Run 'npx prisma db push' to create tables.",
          errorCode: tableError.code,
          errorMessage: tableError.message,
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("[v0] Database initialization check failed:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to check database initialization",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
