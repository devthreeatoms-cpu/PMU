"use server";

import { adminDb } from "@/lib/firebase-admin";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-helpers";

export async function getGlobalSettingsAction() {
  await requireAdmin();
  try {
    const doc = await adminDb.collection("settings").doc("global").get();
    if (!doc.exists) {
      return { 
        success: true, 
        settings: { 
          newArrivalsEmailEnabled: true 
        } 
      };
    }
    return { success: true, settings: doc.data() };
  } catch (err: any) {
    console.error("getGlobalSettingsAction Error:", err);
    return { success: false, error: err.message };
  }
}

export async function updateNewArrivalsToggleAction(enabled: boolean) {
  await requireAdmin();
  try {
    await adminDb.collection("settings").doc("global").set({
      newArrivalsEmailEnabled: enabled,
      updatedAt: Date.now()
    }, { merge: true });
    
    revalidatePath("/admin/dev");
    return { success: true };
  } catch (err: any) {
    console.error("updateNewArrivalsToggleAction Error:", err);
    return { success: false, error: err.message };
  }
}
