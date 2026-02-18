import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { username, password, registrationKey } = await req.json();

  if (!username || !password || !registrationKey) {
    return NextResponse.json(
      { error: "Username, password, and registration key are required" },
      { status: 400 }
    );
  }

  if (registrationKey !== process.env.REGISTRATION_SECRET) {
    return NextResponse.json(
      { error: "Invalid registration key" },
      { status: 403 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    return NextResponse.json(
      { error: "Username already taken" },
      { status: 409 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { username, password: hashedPassword },
  });

  const token = signToken({ userId: user.id, username: user.username });

  const response = NextResponse.json({ user: { id: user.id, username: user.username } });
  response.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60,
    path: "/",
  });

  return response;
}
