import { NextResponse } from "next/server";
import { syncRoleFromIdToken } from "@/lib/user-role-sync";

/**
 * After email or Google login, call this so admin/staff role is copied onto
 * the current Firebase UID when the same email already has privileges under
 * another Auth account (email/password vs Google).
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const idToken = body?.idToken;
    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
    }

    const result = await syncRoleFromIdToken(idToken);
    return NextResponse.json({
      ok: true,
      role: result.role,
      isAdmin: result.isAdmin || result.isStaff,
      isSuperAdmin: result.isSuperAdmin,
      synced: result.synced,
      uid: result.uid,
      email: result.email,
    });
  } catch (err: any) {
    console.error("[auth/sync-role]", err);
    return NextResponse.json(
      { error: err?.message || "Failed to sync role" },
      { status: 401 }
    );
  }
}
