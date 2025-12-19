import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth/session"

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        role: true,
        fullName: true,
        didUri: true,
        nin: true,
        createdAt: true,
      },
    })

    return NextResponse.json(profile)
  } catch (error) {
    console.error("[v0] Failed to fetch profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { fullName, nin } = body

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(fullName && { fullName }),
        ...(nin && { nin }),
      },
      select: {
        id: true,
        email: true,
        role: true,
        fullName: true,
        didUri: true,
        nin: true,
        createdAt: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("[v0] Failed to update profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
