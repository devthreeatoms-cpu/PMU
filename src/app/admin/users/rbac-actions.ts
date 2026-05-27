"use server";

import { getProjectModules } from "@/lib/permissions";
import { adminDb } from "@/lib/firebase-admin";
import { UserPermissions, UserRole } from "@/lib/types";
import { requireAdmin } from "@/lib/auth-helpers";

/**
 * Fetches all available modules in the admin project.
 */
export async function getAllAdminModulesAction() {
  await requireAdmin();
  try {
    const modules = await getProjectModules();
    return { success: true, modules };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Updates a user's role and granular permissions in Firestore.
 */
export async function updateUserPermissionsAction(
  userId: string,
  role: UserRole,
  permissions: UserPermissions,
  isSuperAdmin: boolean = false
) {
  await requireAdmin();
  try {
    await adminDb.collection("users").doc(userId).update({
      role,
      permissions,
      isSuperAdmin,
      updatedAt: Date.now()
    });
    
    return { success: true };
  } catch (error: any) {
    console.error("Error updating user permissions:", error);
    return { success: false, error: error.message };
  }
}
