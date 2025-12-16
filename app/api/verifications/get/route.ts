import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

    const verifications = await prisma.verifications.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ verifications });
  } catch (error: any) {
    console.error("GET /api/verifications error:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
