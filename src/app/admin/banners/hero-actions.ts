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
          title: "Professional PMU supplies,",
          highlightedTitle: "made for artists",
          subtitle: "",
          description:
            "Shop studio-ready needles, pigments, machines, and aftercare. Quality tools trusted by permanent makeup professionals across India.",
          imageUrl: "/images/landing/master-studio.png",
          videoUrl: "",
          buttonText: "Shop products",
          buttonLink: "/products",
          stats: [],
        } as HeroSettings,
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
