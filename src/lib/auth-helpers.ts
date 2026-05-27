import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

const BOOTSTRAP_ADMIN_UID = "JFfgcLKDtTPDsHUxrmi5L7sLIom2";

export async function requireAdmin(): Promise<{ uid: string }> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("__session")?.value;

  if (!sessionCookie) throw new Error("Unauthorized");

  let decoded: Awaited<ReturnType<typeof adminAuth.verifySessionCookie>>;
  try {
    decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
  } catch {
    throw new Error("Unauthorized");
  }

  if (decoded.uid === BOOTSTRAP_ADMIN_UID) return { uid: decoded.uid };

  const userDoc = await adminDb.collection("users").doc(decoded.uid).get();
  const role = userDoc.data()?.role;
  if (role !== "admin" && role !== "staff") throw new Error("Forbidden");

  return { uid: decoded.uid };
}

export async function requireAuth(): Promise<{ uid: string }> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("__session")?.value;

  if (!sessionCookie) throw new Error("Unauthorized");

  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    return { uid: decoded.uid };
  } catch {
    throw new Error("Unauthorized");
  }
}
