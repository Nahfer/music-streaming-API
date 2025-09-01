import jwt, { JwtPayload } from "jsonwebtoken";

interface AuthPayload extends JwtPayload {
  userid: string;
}

export async function middleware(
  request: Request
): Promise<{ userid: string } | null> {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    // Do not throw here; log and return null so callers can decide how to respond
    console.error("JWT_SECRET is not defined in environment variables");
    return null;
  }

  try {
    const decoded = jwt.verify(token, secret) as AuthPayload;
    return { userid: decoded.userid };
  } catch {
    return null;
  }
}
