import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import bcrypt from "bcryptjs"

const SESSION_COOKIE_NAME = "civic_session"
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days

export interface SessionUser {
  id: string
  email: string
  role: string
  fullName: string | null
  did: string | null
}

/**
 * Create a new session for a user
 */
export async function createSession(userId: string): Promise<string> {
  const token = generateToken()
  const expiresAt = new Date(Date.now() + SESSION_DURATION)

  await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  })

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  })

  return token
}

/**
 * Get the current user from session
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

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

/**
 * Delete the current session (logout)
 */
export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (token) {
    await prisma.session.deleteMany({ where: { token } })
    cookieStore.delete(SESSION_COOKIE_NAME)
  }
}

/**
 * Verify a user's password
 */
export async function verifyPassword(email: string, password: string): Promise<SessionUser | null> {
  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) return null

  const isValid = await bcrypt.compare(password, user.passwordHash)
  if (!isValid) return null

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    fullName: user.fullName,
    did: user.did,
  }
}

/**
 * Generate a secure random token
 */
function generateToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}
