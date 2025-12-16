import { PrismaClient } from "@/generated/prisma/client";
import { NextRequest, NextResponse } from "next/server";

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function POST(req: NextRequest) {
  try {
    const { userId, type } = await req.json();

    if (!userId || !type) {
      return NextResponse.json({ error: "Missing userId or type" }, { status: 400 });
    }

    // Create verification record
    const verification = await prisma.verifications.create({
      data: {
        userId,
        type,
        status: "PENDING", // match your enum
      },
    });

    return NextResponse.json({ verification }, { status: 201 });
  } catch (error: any) {
    console.error("Verification API Error:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
