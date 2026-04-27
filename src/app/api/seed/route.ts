import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // ── Security: Only allow seeding in development or with a secret token ──────
  const isDev = process.env.NODE_ENV === "development";
  const seedSecret = process.env.SEED_SECRET;
  const providedToken = request.headers.get("x-seed-token");

  if (!isDev) {
    // In production, require a secret token
    if (!seedSecret || providedToken !== seedSecret) {
      return NextResponse.json(
        { error: "Unauthorized. Provide a valid x-seed-token header." },
        { status: 401 }
      );
    }
  }

  try {
    const PRODUCTS = [
      { 
        name: "V3 Nano Precision Cartridge (20pcs)", 
        price: 55.00, 
        category: "Needles", 
        imageUrls: ["https://images.unsplash.com/photo-1611558709798-e009c8fd7706?auto=format&fit=crop&q=80&w=800"],
        description: "Ultra-sharp nano needles for extreme precision in hairstrokes and shading."
      },
      { 
        name: "Master Shader 1RL 0.25mm", 
        price: 48.00, 
        category: "Needles", 
        imageUrls: ["https://images.unsplash.com/photo-1598300046647-5296761abbc8?auto=format&fit=crop&q=80&w=800"],
        description: "Perfect for delicate lip shading and fine eyeliner work."
      },
      { 
        name: "Midnight Black Eyeliner Pigment", 
        price: 35.00, 
        category: "Pigments", 
        imageUrls: ["https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?auto=format&fit=crop&q=80&w=800"],
        description: "Rich, carbon-black pigment that stays true without turning blue."
      },
      { 
        name: "Dusty Rose Lip Blush Liquid", 
        price: 32.00, 
        category: "Pigments", 
        imageUrls: ["https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=800"],
        description: "A soft, romantic rose shade perfect for natural lip enhancement."
      },
      { 
        name: "Organic Cocoa Brow Pigment", 
        price: 32.00, 
        category: "Pigments", 
        imageUrls: ["https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&q=80&w=800"],
        description: "Warm brown organic pigment for dark brunette brows."
      },
      { 
        name: "Ambition Pro Wireless Pen (Rose Gold)", 
        price: 299.00, 
        salePrice: 249.00,
        category: "Machines & Power Supplies", 
        imageUrls: ["https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=800"],
        description: "Freedom of movement with 8+ hours of battery life and ergonomic grip."
      },
      { 
        name: "Elite Digital Power Unit", 
        price: 185.00, 
        category: "Machines & Power Supplies", 
        imageUrls: ["https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800"],
        description: "Precise voltage control with digital touch-screen interface."
      },
      { 
        name: "Booms Butter Aftercare Balm", 
        price: 15.00, 
        category: "Aftercare", 
        imageUrls: ["https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&q=80&w=800"],
        description: "Soothing botanical butter for intensive healing after PMU procedures."
      },
      { 
        name: "Gentle Cleansing Foam (Before & After)", 
        price: 19.00, 
        category: "Aftercare", 
        imageUrls: ["https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=800"],
        description: "Sulfate-free cleanser designed to protect pigment retention."
      },
      { 
        name: "Signature Practice Latex with Eyes", 
        price: 9.50, 
        category: "Practice Materials", 
        imageUrls: ["https://images.unsplash.com/photo-1583241801142-113b9f5bbde5?auto=format&fit=crop&q=80&w=800"],
        description: "Realistic skin-like texture for practicing hairstroke patterns."
      },
      { 
        name: "Breast Reconstruction Practice 3D Skin", 
        price: 14.00, 
        category: "Practice Materials", 
        imageUrls: ["https://images.unsplash.com/photo-1616391182219-e080b4d1043a?auto=format&fit=crop&q=80&w=800"],
        description: "3D contoured latex for medical tattooing and areola practice."
      },
      { 
        name: "White Mapping Pencil Duo", 
        price: 8.00, 
        category: "Practice Materials", 
        imageUrls: ["https://images.unsplash.com/photo-1596704017254-9b12106ec127?auto=format&fit=crop&q=80&w=800"],
        description: "Smudge-proof white pencils for precise brow mapping."
      },
    ];

    const batch = adminDb.batch();
    
    // Clear existing products
    const existingProducts = await adminDb.collection("products").get();
    existingProducts.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Add new products
    PRODUCTS.forEach((p) => {
      const pRef = adminDb.collection("products").doc();
      batch.set(pRef, {
        ...p,
        slug: p.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
        stock: Math.floor(Math.random() * 50) + 10,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isActive: true
      });
    });

    await batch.commit();
    return NextResponse.json({ message: "Seeding successful", count: PRODUCTS.length });
  } catch (error: any) {
    console.error("Seeding error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
