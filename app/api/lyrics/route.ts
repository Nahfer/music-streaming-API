import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const title = (searchParams.get('title') || '').trim();
    const artist = (searchParams.get('artist') || '').trim();

    // Prefer lookup by track id when provided
    if (id) {
      const track = await prisma.tracks.findUnique({
        where: { tid: id },
        select: { lyrics: true, title: true, artist: { select: { name: true } } },
      });

      if (track) {
        return NextResponse.json({ lyrics: track.lyrics ?? null, title: track.title, artist: track.artist?.name ?? null }, { status: 200 });
      }

      // return 200 with a parsable body rather than a 404 with an empty response
      return NextResponse.json({ lyrics: null, error: 'Lyrics not found' }, { status: 200 });
    }

    // Otherwise try to find by title and optional artist name
    if (!title) {
      // return 200 with error to keep frontend parsing simple
      return NextResponse.json({ lyrics: null, error: 'Missing title parameter' }, { status: 200 });
    }

    const whereClause: Record<string, unknown> = {
      title: { contains: title, mode: 'insensitive' },
    };

    if (artist) {
      const artistFilter = { artist: { name: { contains: artist, mode: 'insensitive' } } };
      Object.assign(whereClause, artistFilter);
    }

    const track = await prisma.tracks.findFirst({
      where: whereClause,
      select: { lyrics: true, title: true, artist: { select: { name: true } } },
      orderBy: { title: 'asc' },
    });

    if (track) {
      return NextResponse.json({ lyrics: track.lyrics ?? null, title: track.title, artist: track.artist?.name ?? null }, { status: 200 });
    }

    return NextResponse.json({ lyrics: null, error: 'Lyrics not found' }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error fetching lyrics:', error);
    return NextResponse.json({ lyrics: null, error: error instanceof Error ? error.message : 'Internal server error' }, { status: 200 });
  }
}
