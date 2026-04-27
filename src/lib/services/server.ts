/**
 * SERVER-ONLY data fetching utilities.
 * These functions use the Firebase Admin SDK and must NEVER be imported by client components.
 * They are safe to use inside Next.js Server Components, generateMetadata, and Route Handlers.
 */

import { adminDb } from "@/lib/firebase-admin";
import { Product } from "@/lib/types";

export interface ServerCategory {
  id: string;
  name: string;
}

export interface ServerBanner {
  id: string;
  title: string;
  highlightedTitle?: string;
  subtitle?: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  imageUrl: string;
  imageSide: "left" | "right";
  bgColor: "white" | "cream";
  badges?: string[];
  bullets?: string[];
  order?: number;
}

// ─── Products ───────────────────────────────────────────────────────────────

export async function getAllProductsServer(): Promise<Product[]> {
  try {
    const snapshot = await adminDb.collection("products").get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Product));
  } catch (error) {
    console.error("[server] getAllProductsServer error:", error);
    return [];
  }
}

export async function getProductByIdServer(productId: string): Promise<Product | null> {
  try {
    const docRef = adminDb.collection("products").doc(productId);
    const snap = await docRef.get();
    if (!snap.exists) return null;
    return { id: snap.id, ...snap.data() } as Product;
  } catch (error) {
    console.error("[server] getProductByIdServer error:", error);
    return null;
  }
}

// ─── Categories ─────────────────────────────────────────────────────────────

export async function getCategoriesServer(): Promise<ServerCategory[]> {
  try {
    const snapshot = await adminDb.collection("categories").get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as ServerCategory));
  } catch (error) {
    console.error("[server] getCategoriesServer error:", error);
    return [];
  }
}

// ─── Banners ─────────────────────────────────────────────────────────────────

export async function getBannersServer(): Promise<ServerBanner[]> {
  try {
    const snapshot = await adminDb
      .collection("banners")
      .orderBy("order", "asc")
      .get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as ServerBanner));
  } catch (error) {
    // Banners may not have an 'order' field — fall back to unordered fetch
    try {
      const snapshot = await adminDb.collection("banners").get();
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as ServerBanner));
    } catch (fallbackError) {
      console.error("[server] getBannersServer error:", fallbackError);
      return [];
    }
  }
}
