import { NextResponse, NextRequest } from "next/server";

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true'
};

export function middleware(request: NextRequest) {
  // Respond to preflight requests immediately
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
  }

  // For other requests, continue and attach CORS headers on the response
  return NextResponse.next({ headers: CORS_HEADERS });
}

export const config = {
  matcher: ['/api/:path*']
};
