import { NextRequest, NextResponse } from "next/server";
import  prisma  from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { registerSchema } from "@/middleware/validation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.flatten() },
        { status: 400 }
      );
    }

    const parsed = validation.data;

    const existingUser = await prisma.artist.findUnique({
      where: { email: parsed.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email is already registered" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(parsed.password, 10);

    const newUser = await prisma.artist.create({
      data: {
        email: parsed.email,
        password: hashedPassword,
        name: parsed.name,
        gender: parsed.gender,
        type: parsed.type,
        bio: parsed.bio,
        profileImageUrl: parsed.profileImageUrl,
      },
    });

    return NextResponse.json(
      { message: "User registered successfully", userId: newUser.aid },
      { status: 201 }
    );
  } catch (error: unknown) {
    // If request.json() failed due to invalid JSON, return 400 instead of 500
    if (error instanceof SyntaxError) {
      console.error("Invalid JSON in request body:", (error as SyntaxError).message);
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
