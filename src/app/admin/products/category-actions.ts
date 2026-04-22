"use server";

import { adminDb } from "@/lib/firebase-admin";

const CATEGORIES_COLLECTION = "categories";

const DEFAULT_CATEGORIES = [
  "Machines & Power Supplies",
  "Needles",
  "Pigments",
  "Practice Materials",
  "Aftercare",
  "Anesthetic/Numbing",
  "Shaping Tools",
  "Lashes",
  "Other"
];

export async function getCategoriesAction() {
  try {
    const snapshot = await adminDb.collection(CATEGORIES_COLLECTION).orderBy("name").get();
    
    // If empty, seed with defaults
    if (snapshot.empty) {
      console.log("Seeding default categories...");
      const batch = adminDb.batch();
      DEFAULT_CATEGORIES.forEach(name => {
        const docRef = adminDb.collection(CATEGORIES_COLLECTION).doc();
        batch.set(docRef, { name, createdAt: Date.now() });
      });
      await batch.commit();
      
      const newSnapshot = await adminDb.collection(CATEGORIES_COLLECTION).orderBy("name").get();
      return { 
        success: true, 
        categories: newSnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name })) 
      };
    }

    const categories = snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
    
    // Custom sort: "Other" should always be last
    categories.sort((a, b) => {
      if (a.name === "Other") return 1;
      if (b.name === "Other") return -1;
      return a.name.localeCompare(b.name);
    });

    return { success: true, categories };
  } catch (err: any) {
    console.error("getCategoriesAction error:", err);
    return { success: false, error: err.message };
  }
}

export async function addCategoryAction(name: string) {
  try {
    const docRef = await adminDb.collection(CATEGORIES_COLLECTION).add({
      name,
      createdAt: Date.now()
    });
    return { success: true, id: docRef.id };
  } catch (err: any) {
    console.error("addCategoryAction error:", err);
    return { success: false, error: err.message };
  }
}

export async function deleteCategoryAction(id: string) {
  try {
    await adminDb.collection(CATEGORIES_COLLECTION).doc(id).delete();
    return { success: true };
  } catch (err: any) {
    console.error("deleteCategoryAction error:", err);
    return { success: false, error: err.message };
  }
}
