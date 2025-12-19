import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import bcrypt from "bcryptjs"
import { randomBytes } from "crypto"

export interface AuthUser {
  id: string
  email: string
  role: string
  fullName: string | null
  did: string | null
}

// Generate a secure session token
export function generateSessionToken(): string {
  return randomBytes(32).toString("hex")
}

// Hash a password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

// Verify a password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// Create a new session
export async function createSession(userId: string): Promise<string> {
  const token = generateSessionToken()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

  await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  })

  const cookieStore = await cookies()
  cookieStore.set("session_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: "/",
  })

  return token
}

// Get current user from session
export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("session_token")?.value

  if (!token) return null

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  })

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await prisma.session.delete({ where: { id: session.id } })
    }
    return null
  }

  return {
    id: session.user.id,
    email: session.user.email,
    role: session.user.role,
    fullName: session.user.fullName,
    did: session.user.did,
  }
}

// Delete session (logout)
export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies()
  const token = cookieStore.get("session_token")?.value

  if (token) {
    await prisma.session.deleteMany({ where: { token } })
    cookieStore.delete("session_token")
  }
}

// Require authentication - throws if not authenticated
export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("Unauthorized")
  }
  return user
}
