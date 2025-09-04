import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim();

    if (!q) {
      return NextResponse.json({ artists: [], albums: [], tracks: [] }, { status: 200 });
    }

    // Perform case-insensitive contains searches across artists, albums and tracks
    const [artists, albums, tracks] = await Promise.all([
      prisma.artist.findMany({
        where: { name: { contains: q, mode: "insensitive" } },
        select: { aid: true, name: true, profileImageUrl: true },
        orderBy: { name: "asc" },
        take: 20,
      }),

      prisma.albums.findMany({
        where: { title: { contains: q, mode: "insensitive" } },
        select: { aaid: true, title: true, albumCover: true, artistid: true },
        orderBy: { title: "asc" },
        take: 20,
      }),

      prisma.tracks.findMany({
        where: { title: { contains: q, mode: "insensitive" } },
        select: {
          tid: true,
          title: true,
          duration: true,
          hostedDirectoryUrl: true,
          artist: { select: { aid: true, name: true } },
          album: { select: { aaid: true, albumCover: true } },
        },
        orderBy: { title: "asc" },
        take: 40,
      }),
    ]);

    return NextResponse.json({ artists, albums, tracks }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof SyntaxError) {
      console.error("Invalid JSON in request body:", (error as SyntaxError).message);
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    console.error("Error performing search:", error);
    return NextResponse.json({ error: (error instanceof Error) ? error.message : "Internal server error" }, { status: 500 });
  }
}
