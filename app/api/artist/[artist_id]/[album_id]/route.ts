import { NextRequest, NextResponse } from "next/server";
import  prisma  from "@/lib/prisma";
import { middleware } from "@/middleware/authentication";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ album_id: string }> }
) {
  try {
    const authorized = await middleware(request);
    if (!authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const albumId = decodeURIComponent( (await params).album_id);
    const { searchParams } = new URL(request.url);
    const trackSearch = searchParams.get("track") || "";

    const albumTracks = await prisma.tracks.findMany({
      where: {
        albumid: albumId,
        ...(trackSearch && {
          title: { contains: trackSearch, mode: "insensitive" },
        }),
      },
      select: {
        tid: true,
        title: true,
        artist: { select: { name: true } },
        duration: true,
        genre: { select: { genre: true } },
        lyrics: true,
        hostedDirectoryUrl: true,
        album: {
          select: {
            aaid: true,
            albumCover: true,
          }
        }
      },
      orderBy: { title: "asc" },
    });

    if (albumTracks.length === 0) {
      return NextResponse.json(
        { error: "No tracks found for this album" },
        { status: 404 }
      );
    }

    return NextResponse.json({ trackList: albumTracks }, { status: 200 });
  } catch (error: unknown) {
    // If request.json() failed due to invalid JSON, return 400 instead of 500
    if (error instanceof SyntaxError) {
      console.error("Invalid JSON in request body:", (error as SyntaxError).message);
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    console.error("Error fetching album tracks:", error);
    return NextResponse.json(
      { error: (error instanceof Error) ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
