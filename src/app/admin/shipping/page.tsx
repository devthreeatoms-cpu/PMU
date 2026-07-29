"use client";

import { useEffect, useState } from "react";
import { Truck, Save, Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { DEFAULT_SHIPPING_SETTINGS, ShippingSettings } from "@/lib/types";
import { getShippingSettingsAction, updateShippingSettingsAction } from "./actions";

export default function ShippingSettingsPage() {
  const [settings, setSettings] = useState<ShippingSettings>({ ...DEFAULT_SHIPPING_SETTINGS });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await getShippingSettingsAction();
      if (res.success) setSettings(res.settings);
      else toast.error(res.error || "Failed to load shipping settings");
      setLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await updateShippingSettingsAction(settings);
      if (!res.success) throw new Error(res.error);
      if (res.settings) setSettings(res.settings);
      toast.success("Shipping charges updated — applies to all products at checkout.");
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-gold" />
      </div>
    );
  }

  const previewFree =
    settings.isEnabled &&
    settings.freeShippingMinOrder > 0 &&
    settings.flatRate > 0;

  return (
    <div className="space-y-8 max-w-2xl animate-in fade-in duration-500">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-gold mb-2">
          Commerce
        </p>
        <h1 className="text-3xl font-heading text-zinc-900 flex items-center gap-3">
          <Truck className="w-7 h-7 text-brand-gold" />
          Shipping Charges
        </h1>
        <p className="text-sm text-zinc-500 mt-2 max-w-xl">
          One universal shipping fee for every order. Customers pay{" "}
          <strong className="text-zinc-800">product price + shipping</strong> at
          checkout. You do not set shipping per product.
        </p>
      </div>

      <Card className="rounded-2xl border-zinc-100 shadow-sm">
        <CardHeader className="border-b border-zinc-50">
          <CardTitle className="text-sm font-bold uppercase tracking-widest text-zinc-600">
            Global rate
          </CardTitle>
          <CardDescription className="text-xs">
            Applied once per order, regardless of how many items are in the cart.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between gap-4 rounded-xl border border-zinc-100 bg-zinc-50/50 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-zinc-900">Enable shipping charges</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                When off, all orders have ₹0 shipping.
              </p>
            </div>
            <Switch
              checked={settings.isEnabled}
              onCheckedChange={(checked) =>
                setSettings((s) => ({ ...s, isEnabled: checked }))
              }
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                Shipping fee (₹)
              </Label>
              <Input
                type="number"
                min={0}
                step="1"
                disabled={!settings.isEnabled}
                value={settings.flatRate}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    flatRate: Math.max(0, Number(e.target.value) || 0),
                  }))
                }
                className="h-11 rounded-xl"
                placeholder="e.g. 80"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                Display label
              </Label>
              <Input
                value={settings.label || ""}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, label: e.target.value }))
                }
                className="h-11 rounded-xl"
                placeholder="Standard Shipping"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              Free shipping above order value (₹)
            </Label>
            <Input
              type="number"
              min={0}
              step="1"
              disabled={!settings.isEnabled}
              value={settings.freeShippingMinOrder}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  freeShippingMinOrder: Math.max(0, Number(e.target.value) || 0),
                }))
              }
              className="h-11 rounded-xl"
              placeholder="0 = no free shipping threshold"
            />
            <p className="text-[11px] text-zinc-400">
              Set to <strong>0</strong> to always charge the flat fee. Example: free shipping
              on orders of ₹2,000 or more.
            </p>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-brand-gold/20 bg-brand-rose/20 px-4 py-3">
            <Info className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
            <div className="text-[12px] text-zinc-700 leading-relaxed space-y-1">
              <p className="font-semibold text-zinc-900">Checkout preview</p>
              {settings.isEnabled && settings.flatRate > 0 ? (
                <>
                  <p>
                    Customer pays:{" "}
                    <span className="font-bold">product total + ₹{settings.flatRate.toFixed(2)}</span>{" "}
                    shipping
                    {previewFree
                      ? ` (free when cart is ₹${settings.freeShippingMinOrder.toLocaleString("en-IN")}+)`
                      : ""}
                    .
                  </p>
                </>
              ) : (
                <p>Shipping is currently free for all orders.</p>
              )}
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="h-11 rounded-full px-8 bg-brand-black hover:bg-brand-gold text-[10px] font-bold uppercase tracking-widest gap-2"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save shipping settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
