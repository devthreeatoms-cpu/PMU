"use server";

import { adminDb } from "@/lib/firebase-admin";

const BANNERS_COLLECTION = "banners";

export interface Banner {
  id?: string;
  title: string;
  subtitle?: string;
  description: string;
  imageSide: 'left' | 'right';
  bgColor?: 'white' | 'cream';
  imageUrl: string;
  buttonText: string;
  buttonLink: string;
  isActive: boolean;
  order: number;
  badges?: string[];
  bullets?: string[];
  highlightedTitle?: string;
  createdAt: number;
}

export async function getBannersAction() {
  try {
    const snapshot = await adminDb.collection(BANNERS_COLLECTION)
      .where("isActive", "==", true)
      .get();
    
    const banners = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Banner[];

    // De-duplicate in-memory by title and sort
    const uniqueBanners: Banner[] = [];
    const seenTitles = new Set();

    banners.forEach(b => {
      if (!seenTitles.has(b.title)) {
        uniqueBanners.push(b);
        seenTitles.add(b.title);
      }
    });

    uniqueBanners.sort((a, b) => (a.order || 0) - (b.order || 0));

    return { success: true, banners: uniqueBanners };
  } catch (err: any) {
    console.error("getBannersAction error:", err);
    return { success: false, error: err.message };
  }
}

export async function getAllBannersAdminAction() {
  try {
    const snapshot = await adminDb.collection(BANNERS_COLLECTION)
      .orderBy("order", "asc")
      .get();
    
    const banners = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Banner[];

    return { success: true, banners };
  } catch (err: any) {
    console.error("getAllBannersAdminAction error:", err);
    return { success: false, error: err.message };
  }
}

export async function addBannerAction(banner: Omit<Banner, 'id' | 'createdAt'>) {
  try {
    const docRef = await adminDb.collection(BANNERS_COLLECTION).add({
      ...banner,
      createdAt: Date.now()
    });
    return { success: true, id: docRef.id };
  } catch (err: any) {
    console.error("addBannerAction error:", err);
    return { success: false, error: err.message };
  }
}

export async function updateBannerAction(id: string, banner: Partial<Banner>) {
  try {
    await adminDb.collection(BANNERS_COLLECTION).doc(id).update({
      ...banner,
      updatedAt: Date.now()
    });
    return { success: true };
  } catch (err: any) {
    console.error("updateBannerAction error:", err);
    return { success: false, error: err.message };
  }
}

export async function deleteBannerAction(id: string) {
  try {
    await adminDb.collection(BANNERS_COLLECTION).doc(id).delete();
    return { success: true };
  } catch (err: any) {
    console.error("deleteBannerAction error:", err);
    return { success: false, error: err.message };
  }
}

export async function reorderBannersAction(bannerIds: string[]) {
  try {
    const batch = adminDb.batch();
    bannerIds.forEach((id, index) => {
      const ref = adminDb.collection(BANNERS_COLLECTION).doc(id);
      batch.update(ref, { order: index + 1 });
    });
    await batch.commit();
    return { success: true };
  } catch (err: any) {
    console.error("reorderBannersAction error:", err);
    return { success: false, error: err.message };
  }
}

// Initial seeding function for the current banners
export async function seedInitialBannersAction() {
  const initialBanners: Omit<Banner, 'id' | 'createdAt'>[] = [
    {
      title: "Organic Smoothie",
      highlightedTitle: "Skin Treatment",
      subtitle: "ETHICAL PURITY",
      description: "\"Petroleum Free! Made with a concentrated mix of all organic oils and vitamins such as B5, C, E, almond oil, avocado oil, and cactus oil. Gentle and soothing for all skin types.\"",
      imageSide: 'right',
      imageUrl: "/images/landing/aftercare.png",
      buttonText: "SHOP AFTERCARE",
      buttonLink: "/products?category=aftercare",
      isActive: true,
      order: 1,
      bgColor: 'cream',
      badges: ["100% ORGANIC", "VITAMIN ENRICHED", "PRO TESTED"]
    },
    {
      title: "New Hair Stroke",
      highlightedTitle: "PATTERNS",
      subtitle: "MASTERY TOOLS",
      description: "Mosha Studio & PMU SUPPLY are proud to announce our newest versions of latex practice skins, designed for easier practice than ever. Now with patterns used by MOSHA on real clients.",
      imageSide: 'left',
      bgColor: 'cream',
      imageUrl: "/images/landing/practice-skins.png",
      buttonText: "SHOP COLLECTION",
      buttonLink: "/products?category=practice-materials",
      isActive: true,
      order: 2,
      bullets: ["NEW LAMINATION STYLES", "PRO-GRIP TEXTURE", "REALIST BROW MAPPING"]
    }
  ];

  try {
    const existingSnapshot = await adminDb.collection(BANNERS_COLLECTION).get();
    const existingTitles = new Set(existingSnapshot.docs.map(doc => doc.data().title));

    const batch = adminDb.batch();
    let added = false;

    initialBanners.forEach(banner => {
      if (!existingTitles.has(banner.title)) {
        const docRef = adminDb.collection(BANNERS_COLLECTION).doc();
        batch.set(docRef, { ...banner, createdAt: Date.now() });
        added = true;
      }
    });

    if (added) {
      await batch.commit();
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
