import { NextResponse } from "next/server";

const PASSWORD = "leo";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (password === PASSWORD) {
      const response = NextResponse.json({ success: true });
      response.cookies.set("site_auth", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
      });
      return response;
    }

    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

