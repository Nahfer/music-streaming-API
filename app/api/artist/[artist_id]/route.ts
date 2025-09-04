import { NextRequest, NextResponse } from "next/server";
import  prisma  from "@/lib/prisma";
import { middleware } from "@/middleware/authentication";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ artist_id: string }> }
) {
  try {
    const authorized = await middleware(request);
    if (!authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const artistId = decodeURIComponent((await params).artist_id);

    const artistProfile = await prisma.artist.findUnique({
      where: { aid: artistId },
      select: {
        name: true,
        profileImageUrl: true,
        bio: true,
      },
    });

    if (!artistProfile) {
      return NextResponse.json({ error: "Artist not found" }, { status: 404 });
    }

    const artistAlbums = await prisma.albums.findMany({
      where: { artistid: artistId },
      select: {
        title: true,
        albumCover: true,
      },
      orderBy: { title: "asc" },
    });

    return NextResponse.json(
      { artist: artistProfile, albums: artistAlbums },
      { status: 200 }
    );
  } catch (error: unknown) {
    // If request.json() failed due to invalid JSON, return 400 instead of 500
    if (error instanceof SyntaxError) {
      console.error("Invalid JSON in request body:", (error as SyntaxError).message);
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    console.error("Error fetching artist data:", error);
    return NextResponse.json(
      { error: (error instanceof Error) ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
