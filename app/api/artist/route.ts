import { NextRequest, NextResponse } from "next/server";
import  prisma  from "@/lib/prisma";
import { middleware } from "@/middleware/authentication";

export async function GET(request: NextRequest) {
  try {
    const authorized = await middleware(request);
    if (!authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const artistSearch = searchParams.get("artist") || "";

    const artistList = await prisma.artist.findMany({
      where: artistSearch
        ? { name: { contains: artistSearch, mode: "insensitive" } }
        : {},
      select: {
        name: true,
        profileImageUrl: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ artistList }, { status: 200 });
  } catch (error) {
    console.error("Error fetching artists:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
