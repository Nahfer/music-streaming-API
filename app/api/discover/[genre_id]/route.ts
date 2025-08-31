import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { middleware } from "@/middleware/authentication";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ genre_id: string }> }
) {
  const genreId = decodeURIComponent((await params).genre_id);

  const authorized = await middleware(request);
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const trackSearch = searchParams.get("track") || "";

    const trackList = await prisma.tracks.findMany({
      where: {
        genreid: genreId,
        ...(trackSearch && {
          title: { contains: trackSearch, mode: "insensitive" },
        }),
      },
      select: {
        title: true,
        artist: { select: { name: true } },
        duration: true,
        genre: { select: { genre: true } },
        lyrics: true,
        hostedDirectoryUrl: true,
      },
      orderBy: [{ title: "asc" }],
    });

    return NextResponse.json({ trackList }, { status: 200 });
  } catch (error) {
    console.error("Error fetching tracks by genre:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
