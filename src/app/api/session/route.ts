import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

const SESSION_DURATION_MS = 5 * 24 * 60 * 60 * 1000; // 5 days

export async function POST(req: Request) {
  try {
    const { idToken } = await req.json();
    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
    }

    // Verify token is valid before minting session
    await adminAuth.verifyIdToken(idToken);

    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_DURATION_MS,
    });

    // Set cookie on the response object (reliable in App Router route handlers)
    const res = NextResponse.json({ ok: true });
    res.cookies.set("__session", sessionCookie, {
      maxAge: Math.floor(SESSION_DURATION_MS / 1000),
      httpOnly: true,
      // secure only in production — localhost is http
      secure: process.env.NODE_ENV === "production",
      path: "/",
      // lax so cookie is sent on top-level navigations + same-site fetches/server actions
      sameSite: "lax",
    });
    return res;
  } catch (err: any) {
    console.error("[session] create error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to create session" },
      { status: 401 }
    );
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("__session", "", {
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });
  return res;
}
