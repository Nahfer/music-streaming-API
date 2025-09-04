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

    const userPlaylists = await prisma.playlist.findMany({
      where: { creatorid: uid },
      select: {
        pid: true,
        playlistTitle: true,
        tracks: {
          select: {
            tid: true,
            title: true,
            artist: { select: { name: true } },
            genre: { select: { genre: true } },
            duration: true,
            hostedDirectoryUrl: true,
          },
        },
      },
      orderBy: { playlistTitle: "asc" },
    });

    const playlistsWithCount = userPlaylists.map((p) => ({
      ...p,
      trackCount: p.tracks?.length ?? 0,
    }));

    return NextResponse.json({ playlists: playlistsWithCount }, { status: 200 });
  } catch (error: unknown) {
    // If request.json() failed due to invalid JSON, return 400 instead of 500
    if (error instanceof SyntaxError) {
      console.error("Invalid JSON in request body:", (error as SyntaxError).message);
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    console.error("Error fetching user playlists:", error);
    return NextResponse.json(
      { error: (error instanceof Error) ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}


export async function POST(request: NextRequest) {
  try {
    const authorized = await middleware(request);
    if (!authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { playlistTitle, trackIds } = body;

    if (!playlistTitle || !Array.isArray(trackIds) || trackIds.length === 0) {
      return NextResponse.json(
        { error: "playlistTitle and non-empty trackIds are required" },
        { status: 400 }
      );
    }

    const newPlaylist = await prisma.playlist.create({
      data: {
        playlistTitle,
        creatorid: authorized.userid,
        tracks: {
          connect: trackIds.map((tid: string | number) => ({
            tid: String(tid),
          })),
        },
      },
      include: {
        tracks: true,
      },
    });

    const playlistWithCount = {
      ...newPlaylist,
      trackCount: newPlaylist.tracks?.length ?? 0,
    };

    return NextResponse.json({ playlist: playlistWithCount }, { status: 201 });
  } catch (error: unknown) {
    // If request.json() failed due to invalid JSON, return 400 instead of 500
    if (error instanceof SyntaxError) {
      console.error("Invalid JSON in request body:", (error as SyntaxError).message);
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    console.error("Error creating playlist:", error);
    return NextResponse.json(
      { error: (error instanceof Error) ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
