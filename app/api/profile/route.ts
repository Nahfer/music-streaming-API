// /app/api/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import  prisma  from "@/lib/prisma";
import { middleware } from "@/middleware/authentication";

export async function GET(request: NextRequest) {
  try {
    const authorized = await middleware(request);
    if (!authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const uid = authorized.userid;

    const userProfile = await prisma.artist.findUnique({
      where: { aid: uid },
      select: {
        aid: true,
        email: true,
        name: true,
        gender: true,
        type: true,
        bio: true,
        profileImageUrl: true,
        albums: {
          select: {
            aaid: true,
            title: true,
            albumCover: true,
          },
        },
        tracks: {
          select: {
            tid: true,
            title: true,
            hostedDirectoryUrl: true,
          },
        },
      },
    });

    if (!userProfile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ profile: userProfile }, { status: 200 });
  } catch (error: unknown) {
    // Although GET rarely contains a JSON body, handle SyntaxError just in case
    if (error instanceof SyntaxError) {
      console.error("Invalid JSON in request body:", (error as SyntaxError).message);
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
