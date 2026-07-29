"use server";

import { adminDb } from "@/lib/firebase-admin";
import { DEFAULT_SHIPPING_SETTINGS, ShippingSettings } from "@/lib/types";
import { normalizeShippingSettings } from "@/lib/shipping";
import { requireAdmin } from "@/lib/auth-helpers";

const DOC = adminDb.collection("siteSettings").doc("shipping");

/** Public — used by checkout to show shipping fee */
export async function getShippingSettingsAction(): Promise<{
  success: boolean;
  settings: ShippingSettings;
  error?: string;
}> {
  try {
    const snap = await DOC.get();
    if (!snap.exists) {
      return { success: true, settings: { ...DEFAULT_SHIPPING_SETTINGS } };
    }
    return {
      success: true,
      settings: normalizeShippingSettings(snap.data() as ShippingSettings),
    };
  } catch (err: any) {
    console.error("getShippingSettingsAction:", err);
    return {
      success: false,
      settings: { ...DEFAULT_SHIPPING_SETTINGS },
      error: err.message,
    };
  }
}

export async function updateShippingSettingsAction(
  input: Partial<ShippingSettings>
): Promise<{ success: boolean; error?: string; settings?: ShippingSettings }> {
  try {
    await requireAdmin();
    const settings = normalizeShippingSettings({
      ...input,
      updatedAt: Date.now(),
    });
    await DOC.set(settings, { merge: true });
    return { success: true, settings };
  } catch (err: any) {
    console.error("updateShippingSettingsAction:", err);
    return { success: false, error: err.message || "Failed to save shipping settings" };
  }
}
