"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Trash2, X, Info, ChevronDown, Package, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ProductOption, ProductVariant } from "@/lib/types";
import { cn } from "@/lib/utils";

interface VariantManagerProps {
  options: ProductOption[];
  variants: ProductVariant[];
  basePrice: number;
  baseSku: string;
  onChange: (options: ProductOption[], variants: ProductVariant[]) => void;
}

export default function VariantManager({ 
  options, 
  variants, 
  basePrice,
  baseSku,
  onChange 
}: VariantManagerProps) {
  const [localOptions, setLocalOptions] = useState<ProductOption[]>(options || []);
  const [localVariants, setLocalVariants] = useState<ProductVariant[]>(variants || []);

  // Sync with props if they change externally (mostly for initialization)
  useEffect(() => {
    if (options && options.length > 0) setLocalOptions(options);
    if (variants && variants.length > 0) setLocalVariants(variants);
  }, [options, variants]);

  const addOption = () => {
    const newOption: ProductOption = {
      id: crypto.randomUUID(),
      name: "",
      values: [],
    };
    const updated = [...localOptions, newOption];
    setLocalOptions(updated);
    generateVariants(updated);
  };

  const removeOption = (id: string) => {
    const updated = localOptions.filter((o) => o.id !== id);
    setLocalOptions(updated);
    generateVariants(updated);
  };

  const updateOptionName = (id: string, name: string) => {
    const updated = localOptions.map((o) => (o.id === id ? { ...o, name } : o));
    setLocalOptions(updated);
    // Don't regenerate variants yet, just updating metadata
    onChange(updated, localVariants);
  };

  const addValue = (optionId: string, value: string) => {
    if (!value.trim()) return;
    const updated = localOptions.map((o) => {
      if (o.id === optionId && !o.values.includes(value.trim())) {
        return { ...o, values: [...o.values, value.trim()] };
      }
      return o;
    });
    setLocalOptions(updated);
    generateVariants(updated);
  };

  const removeValue = (optionId: string, value: string) => {
    const updated = localOptions.map((o) => {
      if (o.id === optionId) {
        return { ...o, values: o.values.filter((v) => v !== value) };
      }
      return o;
    });
    setLocalOptions(updated);
    generateVariants(updated);
  };

  const generateVariants = (currentOptions: ProductOption[]) => {
    if (currentOptions.length === 0) {
      setLocalVariants([]);
      onChange(currentOptions, []);
      return;
    }

    // Cartesian Product logic
    const combinations = currentOptions.reduce((acc: any[][], option) => {
      if (option.values.length === 0) return acc;
      const next: any[][] = [];
      if (acc.length === 0) {
        return option.values.map(val => [{ [option.name || "Unnamed"]: val }]);
      }
      acc.forEach(prevCombo => {
        option.values.forEach(val => {
          next.push([...prevCombo, { [option.name || "Unnamed"]: val }]);
        });
      });
      return next;
    }, []);

    const newVariants: ProductVariant[] = combinations.map((combo) => {
      const combination = combo.reduce((acc, obj) => ({ ...acc, ...obj }), {});
      
      // Try to find existing variant to preserve its data
      const existing = localVariants.find(v => 
        JSON.stringify(v.combination) === JSON.stringify(combination)
      );

      if (existing) return existing;

      return {
        id: crypto.randomUUID(),
        combination,
        price: basePrice || 0,
        stock: 0,
        sku: baseSku ? `${baseSku}-${Object.values(combination).join("-")}` : "",
        isActive: true,
      };
    });

    setLocalVariants(newVariants);
    onChange(currentOptions, newVariants);
  };

  const updateVariant = (id: string, field: keyof ProductVariant, value: any) => {
    const updated = localVariants.map((v) => (v.id === id ? { ...v, [field]: value } : v));
    setLocalVariants(updated);
    onChange(localOptions, updated);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Step 1: Define Options */}
      <Card className="rounded-[2.5rem] border-zinc-100 shadow-sm overflow-hidden">
        <CardHeader className="bg-zinc-50/50 border-b border-zinc-50">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg">Option Structures</CardTitle>
              <CardDescription className="text-[10px] font-medium uppercase tracking-widest text-zinc-400 mt-1">Defining Product Dimensions</CardDescription>
            </div>
            <Button 
              type="button" 
              variant="outline" 
              onClick={addOption}
              className="rounded-full h-10 px-6 border-zinc-200 hover:bg-zinc-50 text-[10px] font-bold uppercase tracking-widest"
            >
              <Plus className="h-3.5 w-3.5 mr-2" /> Add Option Group
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-8 space-y-6">
          {localOptions.length === 0 ? (
            <div className="py-12 text-center bg-zinc-50/50 rounded-[2rem] border-2 border-dashed border-zinc-100">
               <Info className="h-8 w-8 mx-auto text-zinc-300 mb-3" />
               <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">No dimensions defined yet.</p>
               <p className="text-[10px] text-zinc-400 italic mt-2">Start by adding an option group like "Size" or "Color".</p>
            </div>
          ) : (
            <div className="space-y-4">
              {localOptions.map((option, idx) => (
                <div key={option.id} className="p-6 bg-zinc-50/50 rounded-[2rem] border border-zinc-100 space-y-4 group">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 space-y-1">
                      <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-4">Option Designation</Label>
                      <div className="flex gap-3">
                        <Input 
                          placeholder="e.g. Needle Size, Pigment Tone..."
                          value={option.name}
                          onChange={(e) => updateOptionName(option.id, e.target.value)}
                          className="h-12 bg-white rounded-full border-zinc-100 px-6 text-xs font-bold"
                        />
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon"
                          onClick={() => removeOption(option.id)}
                          className="h-12 w-12 rounded-full text-zinc-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-4">Available Manifestations</Label>
                    <div className="flex flex-wrap gap-2 p-3 bg-white rounded-2xl border border-zinc-100 min-h-[60px]">
                      {option.values.map((val) => (
                        <div key={val} className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-1.5 rounded-full text-[10px] font-bold tracking-wider group/val">
                          {val}
                          <button 
                            type="button" 
                            onClick={() => removeValue(option.id, val)}
                            className="hover:text-red-400 transition-colors"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                      <input 
                        type="text"
                        placeholder="Add value..."
                        className="flex-1 min-w-[120px] bg-transparent outline-none text-[10px] font-bold px-3 uppercase tracking-widest placeholder:text-zinc-300"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addValue(option.id, (e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = "";
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 2: Manage Variant Matrix */}
      {localVariants.length > 0 && (
        <Card className="rounded-[2.5rem] border-zinc-100 shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-700">
          <CardHeader className="bg-zinc-50/50 border-b border-zinc-50">
            <CardTitle className="text-lg">Manifestation Matrix</CardTitle>
            <CardDescription className="text-[10px] font-medium uppercase tracking-widest text-zinc-400 mt-1">
              Synchronizing {localVariants.length} Unique Combinations
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
             <div className="overflow-x-auto no-scrollbar -mx-6 px-6">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-50">
                      <th className="text-left py-4 px-4 text-[9px] font-black uppercase tracking-widest text-zinc-400">Combination</th>
                      <th className="text-left py-4 px-4 text-[9px] font-black uppercase tracking-widest text-zinc-400">Value (₹)</th>
                      <th className="text-left py-4 px-4 text-[9px] font-black uppercase tracking-widest text-zinc-400">Supply</th>
                      <th className="text-left py-4 px-4 text-[9px] font-black uppercase tracking-widest text-zinc-400">Reference SKU</th>
                    </tr>
                  </thead>
                  <tbody>
                    {localVariants.map((variant) => (
                      <tr key={variant.id} className="border-b border-zinc-50 hover:bg-zinc-50/30 transition-colors">
                        <td className="py-6 px-4">
                          <div className="flex gap-1.5 flex-wrap">
                            {Object.entries(variant.combination).map(([opt, val]) => (
                              <span key={opt} className="bg-white border border-zinc-100 text-zinc-900 px-3 py-1 rounded-lg text-[9px] font-bold shadow-sm">
                                <span className="opacity-40 font-medium mr-1">{opt}:</span> {val}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-4 px-4 min-w-[120px]">
                           <div className="relative">
                              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-300" />
                              <Input 
                                type="number"
                                value={variant.price}
                                onChange={(e) => updateVariant(variant.id, "price", parseFloat(e.target.value) || 0)}
                                className="h-10 pl-8 rounded-xl bg-white border-zinc-100 text-[11px] font-bold focus:ring-brand-gold/10"
                              />
                           </div>
                        </td>
                        <td className="py-4 px-4 min-w-[100px]">
                           <div className="relative">
                              <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-300" />
                              <Input 
                                type="number"
                                value={variant.stock}
                                onChange={(e) => updateVariant(variant.id, "stock", parseInt(e.target.value, 10) || 0)}
                                className="h-10 pl-8 rounded-xl bg-white border-zinc-100 text-[11px] font-bold focus:ring-brand-gold/10"
                              />
                           </div>
                        </td>
                        <td className="py-4 px-4 min-w-[180px]">
                           <Input 
                             value={variant.sku}
                             onChange={(e) => updateVariant(variant.id, "sku", e.target.value)}
                             placeholder="Variant SKU"
                             className="h-10 rounded-xl bg-white border-zinc-100 text-[10px] font-medium tracking-tight"
                           />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
