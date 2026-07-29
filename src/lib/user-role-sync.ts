import { adminAuth, adminDb } from "@/lib/firebase-admin";

export type PrivilegedRole = "admin" | "staff";

export function normalizeEmail(email: string | null | undefined): string {
  return (email || "").trim().toLowerCase();
}

function isPrivilegedRole(role: unknown): role is PrivilegedRole {
  return role === "admin" || role === "staff";
}

/**
 * Find a privileged (admin/staff) user profile that shares this email.
 * Handles Firebase creating different UIDs for email/password vs Google
 * while the same person has admin on only one of those docs.
 */
export async function findPrivilegedProfileByEmail(email: string | null | undefined) {
  const normalized = normalizeEmail(email);
  if (!normalized) return null;

  // Primary query (normalized). Also try original casing for older docs.
  const candidates = Array.from(
    new Set([normalized, (email || "").trim()].filter(Boolean))
  );

  for (const candidate of candidates) {
    const snap = await adminDb
      .collection("users")
      .where("email", "==", candidate)
      .limit(20)
      .get();

    for (const doc of snap.docs) {
      const data = doc.data();
      if (isPrivilegedRole(data.role)) {
        return {
          uid: doc.id,
          role: data.role as PrivilegedRole,
          isSuperAdmin: data.isSuperAdmin === true,
          permissions: data.permissions || null,
          displayName: data.displayName || "",
          email: data.email || candidate,
        };
      }
    }
  }

  // Fallback: emails may be mixed-case on older admin docs — match among admin/staff only
  const [adminSnap, staffSnap] = await Promise.all([
    adminDb.collection("users").where("role", "==", "admin").limit(50).get(),
    adminDb.collection("users").where("role", "==", "staff").limit(50).get(),
  ]);

  for (const doc of [...adminSnap.docs, ...staffSnap.docs]) {
    const data = doc.data();
    if (normalizeEmail(data.email) === normalized) {
      return {
        uid: doc.id,
        role: data.role as PrivilegedRole,
        isSuperAdmin: data.isSuperAdmin === true,
        permissions: data.permissions || null,
        displayName: data.displayName || "",
        email: data.email || normalized,
      };
    }
  }

  return null;
}

export type SyncRoleResult = {
  role: string;
  isAdmin: boolean;
  isStaff: boolean;
  isSuperAdmin: boolean;
  synced: boolean;
};

/**
 * Ensure users/{uid} inherits admin/staff if the same email already has that role
 * on another Firebase Auth UID (classic email-login vs Google-login split).
 */
export async function syncPrivilegedRoleForUid(
  uid: string,
  email: string | null | undefined
): Promise<SyncRoleResult> {
  const normalized = normalizeEmail(email);
  const userRef = adminDb.collection("users").doc(uid);
  const userSnap = await userRef.get();
  const current = userSnap.data() || {};

  if (isPrivilegedRole(current.role)) {
    // Normalize email on privileged docs for future lookups
    if (normalized && current.email !== normalized) {
      await userRef.set({ email: normalized }, { merge: true });
    }
    return {
      role: current.role,
      isAdmin: current.role === "admin",
      isStaff: current.role === "staff",
      isSuperAdmin: current.isSuperAdmin === true,
      synced: false,
    };
  }

  const privileged = await findPrivilegedProfileByEmail(email || normalized);
  if (!privileged || privileged.uid === uid) {
    const role = (current.role as string) || "customer";
    return {
      role,
      isAdmin: false,
      isStaff: false,
      isSuperAdmin: false,
      synced: false,
    };
  }

  const patch: Record<string, unknown> = {
    uid,
    email: normalized || privileged.email,
    role: privileged.role,
    isSuperAdmin: privileged.isSuperAdmin,
    displayName:
      current.displayName || privileged.displayName || "Admin",
    updatedAt: Date.now(),
    roleSyncedFromUid: privileged.uid,
    roleSyncedAt: Date.now(),
  };

  if (privileged.permissions) {
    patch.permissions = privileged.permissions;
  }

  if (!userSnap.exists) {
    await userRef.set(
      {
        ...patch,
        createdAt: Date.now(),
      },
      { merge: true }
    );
  } else {
    await userRef.set(patch, { merge: true });
  }

  return {
    role: privileged.role,
    isAdmin: privileged.role === "admin",
    isStaff: privileged.role === "staff",
    isSuperAdmin: privileged.isSuperAdmin,
    synced: true,
  };
}

/** Verify Firebase ID token and sync privileged role for that user. */
export async function syncRoleFromIdToken(idToken: string): Promise<SyncRoleResult & { uid: string; email: string }> {
  const decoded = await adminAuth.verifyIdToken(idToken);
  const result = await syncPrivilegedRoleForUid(decoded.uid, decoded.email || null);
  return {
    ...result,
    uid: decoded.uid,
    email: normalizeEmail(decoded.email),
  };
}
