import { DEFAULT_SHIPPING_SETTINGS, ShippingSettings } from "@/lib/types";

export function normalizeShippingSettings(
  raw: Partial<ShippingSettings> | null | undefined
): ShippingSettings {
  return {
    flatRate: Math.max(0, Number(raw?.flatRate ?? DEFAULT_SHIPPING_SETTINGS.flatRate) || 0),
    freeShippingMinOrder: Math.max(
      0,
      Number(raw?.freeShippingMinOrder ?? DEFAULT_SHIPPING_SETTINGS.freeShippingMinOrder) || 0
    ),
    isEnabled: raw?.isEnabled !== false,
    label: (raw?.label || DEFAULT_SHIPPING_SETTINGS.label || "Standard Shipping").trim(),
    updatedAt: raw?.updatedAt,
  };
}

/**
 * Compute shipping for an order.
 * @param subtotalAfterDiscount product subtotal after coupon product-discount
 * @param freeShippingCoupon when true (coupon type free_shipping), force ₹0
 */
export function computeShippingAmount(
  settings: ShippingSettings,
  subtotalAfterDiscount: number,
  freeShippingCoupon = false
): number {
  if (freeShippingCoupon) return 0;
  if (!settings.isEnabled) return 0;
  const rate = Math.max(0, Number(settings.flatRate) || 0);
  if (rate <= 0) return 0;
  const threshold = Math.max(0, Number(settings.freeShippingMinOrder) || 0);
  if (threshold > 0 && subtotalAfterDiscount >= threshold) return 0;
  return Math.round(rate * 100) / 100;
}
