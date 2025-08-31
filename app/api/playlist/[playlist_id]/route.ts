import { NextRequest, NextResponse } from "next/server";
import  prisma  from "@/lib/prisma";
import { middleware } from "@/middleware/authentication";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ playlist_id: string }> }
) {
  try {
    const authorized = await middleware(request);
    if (!authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const playlistId = decodeURIComponent((await params).playlist_id);

    const playlist = await prisma.playlist.findUnique({
      where: { pid: playlistId },
      select: {
        playlistTitle: true,
        tracks: {
          select: {
            tid: true,
            title: true,
            duration: true,
            artist: { select: { name: true } },
            genre: { select: { genre: true } },
            hostedDirectoryUrl: true,
          },
          orderBy: { title: "asc" },
        },
      },
    });

    if (!playlist) {
      return NextResponse.json(
        { error: "Playlist not found" },
        { status: 404 }
      );
    }

    const playlistWithCount = {
      ...playlist,
      trackCount: playlist.tracks?.length ?? 0,
    };

    return NextResponse.json({ playlist: playlistWithCount }, { status: 200 });
  } catch (error) {
    console.error("Error fetching playlist tracks:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ playlist_id: string }> }
) {
  try {
    const authorized = await middleware(request);
    if (!authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const playlistId = decodeURIComponent((await params).playlist_id);
    const body = await request.json();
    const { playlistTitle, trackIds } = body;

    const existing = await prisma.playlist.findUnique({
      where: { pid: playlistId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Playlist not found" },
        { status: 404 }
      );
    }

    if (existing.creatorid !== authorized.userid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updatedPlaylist = await prisma.playlist.update({
      where: { pid: playlistId },
      data: {
        playlistTitle: playlistTitle ?? existing.playlistTitle,
        ...(trackIds && {
          tracks: {
            set: trackIds.map((tid: string | number) => ({ tid: String(tid) })),
          },
        }),
      },
      include: { tracks: true },
    });

    const playlistWithCount = {
      ...updatedPlaylist,
      trackCount: updatedPlaylist.tracks?.length ?? 0,
    };

    return NextResponse.json({ playlist: playlistWithCount }, { status: 200 });
  } catch (error) {
    console.error("Error updating playlist:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ playlist_id: string }> }
) {
  try {
    const authorized = await middleware(request);
    if (!authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const playlistId = decodeURIComponent((await params).playlist_id);

    const existing = await prisma.playlist.findUnique({
      where: { pid: playlistId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Playlist not found" },
        { status: 404 }
      );
    }

    if (existing.creatorid !== authorized.userid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.playlist.delete({ where: { pid: playlistId } });

    return NextResponse.json(
      { success: "Playlist deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting playlist:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
