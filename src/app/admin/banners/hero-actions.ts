"use server";

import { adminDb } from "@/lib/firebase-admin";
import { revalidatePath } from "next/cache";

export interface HeroSettings {
  title: string;
  highlightedTitle: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  videoUrl: string;
  buttonText: string;
  buttonLink: string;
  stats: { label: string; sub: string }[];
  updatedAt?: any;
}

const HERO_DOC_ID = "main-hero";

export async function getHeroSettingsAction() {
  try {
    const doc = await adminDb.collection("settings").doc(HERO_DOC_ID).get();
    if (!doc.exists) {
      // Return default settings if not found
      return {
        success: true,
        settings: {
          title: "PRECISION",
          highlightedTitle: "PMU",
          subtitle: "THE COMPLETE CATALOG",
          description: "Enter the vault of unlimited possibilities. From revolutionary E95 Machines to our signature Organic Pigments—we supply everything an elite PMU artist needs.",
          imageUrl: "/images/landing/master-studio.png",
          videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-glitter-particles-moving-in-a-black-background-4217-large.mp4",
          buttonText: "VIEW ALL PRODUCTS",
          buttonLink: "/products",
          stats: [
            { label: "300+", sub: "SKUs" },
            { label: "100%", sub: "Vegan" },
            { label: "PRO", sub: "Level" },
            { label: "INDIA", sub: "Supply" }
          ]
        } as HeroSettings
      };
    }
    const data = doc.data();
    if (data && data.updatedAt && typeof data.updatedAt.toDate === 'function') {
      data.updatedAt = data.updatedAt.toDate().getTime();
    }
    return { success: true, settings: data as HeroSettings };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateHeroSettingsAction(settings: HeroSettings) {
  try {
    await adminDb.collection("settings").doc(HERO_DOC_ID).set({
      ...settings,
      updatedAt: new Date()
    }, { merge: true });
    
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
