import { NextRequest, NextResponse } from "next/server";
import  prisma  from "@/lib/prisma";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { loginSchema } from "@/middleware/validation";

export async function POST(request: NextRequest) {
  try {
    const credentials = await request.json();

    const validation = loginSchema.safeParse(credentials);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    const existingUser = await prisma.artist.findUnique({ where: { email } });
    if (!existingUser) {
      return NextResponse.json(
        { error: "User with this email doesn't exist" },
        { status: 404 }
      );
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET not defined in environment variables");
      return NextResponse.json(
        { error: "Server misconfiguration" },
        { status: 500 }
      );
    }

    const token = jwt.sign(
      { name: existingUser.name, userid: existingUser.aid },
      secret,
      { expiresIn: "1h" }
    );

    return NextResponse.json(
      { success: "Login successful", token },
      { status: 200 }
    );
  } catch (error: unknown) {
    // If request.json() failed due to invalid JSON, return 400 instead of 500
    if (error instanceof SyntaxError) {
      console.error("Invalid JSON in request body:", error.message);
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    console.error("Login error:", error);
    return NextResponse.json(
      { error: (error instanceof Error) ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
