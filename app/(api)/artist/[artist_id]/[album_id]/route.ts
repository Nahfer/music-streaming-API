import { NextRequest, NextResponse } from "next/server";
import  prisma  from "@/lib/prisma";
import { middleware } from "@/middleware/authentication";

export async function GET(
  request: NextRequest,
  { params }: { params: { album_id: string } }
) {
  try {
    const authorized = await middleware(request);
    if (!authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const albumId = decodeURIComponent(params.album_id);
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
        title: true,
        artist: { select: { name: true } },
        duration: true,
        genre: { select: { genre: true } },
        lyrics: true,
        hostedDirectoryUrl: true,
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
  } catch (error) {
    console.error("Error fetching album tracks:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
