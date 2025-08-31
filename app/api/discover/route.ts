import { NextRequest, NextResponse } from "next/server";
import  prisma  from "@/lib/prisma";
import { middleware } from "@/middleware/authentication";

export async function GET(request: NextRequest) {
  try {
    const authorized = await middleware(request);

    if (!authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const genreList = await prisma.genre.findMany({
      select: {
        genre: true,
        genreCoverUrl: true,
      },
      orderBy: {
        genre: "asc",
      },
    });

    return NextResponse.json({ genreList }, { status: 200 });
  } catch (error) {
    console.error("Error fetching genres:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
