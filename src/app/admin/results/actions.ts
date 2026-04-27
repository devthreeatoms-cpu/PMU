"use server";

import { adminDb } from "@/lib/firebase-admin";

const RESULTS_COLLECTION = "resultsGallery_v3";

export interface ResultItem {
  id?: string;
  url: string;
  title: string;
  order: number;
  isActive: boolean;
  createdAt?: number;
}

export async function getResultsAction() {
  try {
    const snapshot = await adminDb.collection(RESULTS_COLLECTION)
      .orderBy("order", "asc")
      .get();
    
    const results = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as ResultItem))
      .filter(r => r.isActive !== false);

    return { success: true, results };
  } catch (err: any) {
    console.error("getResultsAction error:", err);
    return { success: false, error: err.message };
  }
}

export async function getAllResultsAdminAction() {
  try {
    const snapshot = await adminDb.collection(RESULTS_COLLECTION)
      .orderBy("order", "asc")
      .get();
    
    const results = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ResultItem[];

    return { success: true, results };
  } catch (err: any) {
    console.error("getAllResultsAdminAction error:", err);
    return { success: false, error: err.message };
  }
}

export async function addResultAction(result: { title: string; url: string; order: number; isActive: boolean }) {
  try {
    const data = {
      title: result.title,
      url: result.url,
      order: Number(result.order),
      isActive: Boolean(result.isActive),
      createdAt: Date.now()
    };
    
    console.log("Attempting to add result:", data);
    const docRef = await adminDb.collection(RESULTS_COLLECTION).add(data);
    return { success: true, id: docRef.id };
  } catch (err: any) {
    console.error("addResultAction error:", err);
    return { success: false, error: err.message };
  }
}

export async function updateResultAction(id: string, result: Partial<ResultItem>) {
  try {
    const updateData: any = {
      updatedAt: Date.now()
    };

    if (result.title !== undefined) updateData.title = result.title;
    if (result.url !== undefined) updateData.url = result.url;
    if (result.order !== undefined) updateData.order = Number(result.order);
    if (result.isActive !== undefined) updateData.isActive = Boolean(result.isActive);

    await adminDb.collection(RESULTS_COLLECTION).doc(id).update(updateData);
    return { success: true };
  } catch (err: any) {
    console.error("updateResultAction error:", err);
    return { success: false, error: err.message };
  }
}

export async function deleteResultAction(id: string) {
  try {
    await adminDb.collection(RESULTS_COLLECTION).doc(id).delete();
    return { success: true };
  } catch (err: any) {
    console.error("deleteResultAction error:", err);
    return { success: false, error: err.message };
  }
}

export async function reorderResultsAction(resultIds: string[]) {
  try {
    const batch = adminDb.batch();
    resultIds.forEach((id, index) => {
      const ref = adminDb.collection(RESULTS_COLLECTION).doc(id);
      batch.update(ref, { order: index + 1 });
    });
    await batch.commit();
    return { success: true };
  } catch (err: any) {
    console.error("reorderResultsAction error:", err);
    return { success: false, error: err.message };
  }
}

export async function seedInitialResultsAction() {
  const initialResults = [
    { url: "/images/landing/microblading-result.png", title: "Microblading", order: 1, isActive: true },
    { url: "/images/landing/lip-blush-result.png", title: "Lip Blush", order: 2, isActive: true },
    { url: "/images/landing/eyeliner-result.png", title: "Eyeliner", order: 3, isActive: true },
    { url: "/images/landing/brow-class.png", title: "Master Class", order: 4, isActive: true },
  ];

  try {
    const batch = adminDb.batch();
    initialResults.forEach(res => {
      const docRef = adminDb.collection(RESULTS_COLLECTION).doc();
      batch.set(docRef, { ...res, createdAt: Date.now() });
    });
    await batch.commit();
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
