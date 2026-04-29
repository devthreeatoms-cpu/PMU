"use server";

import { adminDb } from "@/lib/firebase-admin";
import { Review } from "@/lib/types";
import { createAdminNotification } from "@/lib/notifications";

export async function submitReviewAction(data: Partial<Review>) {
  try {
    const reviewData = {
      ...data,
      status: "pending",
      isAdminPost: false,
      createdAt: Date.now(),
    };
    await adminDb.collection("reviews").add(reviewData);

    // Create admin notification
    await createAdminNotification({
      type: "review",
      title: "New Product Review",
      message: `${reviewData.userName} left a ${reviewData.rating}-star review for ${reviewData.productName || 'a product'}.`,
      link: "/admin/reviews"
    });

    return { success: true };
  } catch (err: any) {
    console.error("submitReviewAction error:", err);
    return { success: false, error: err.message };
  }
}

export async function updateReviewStatusAction(id: string, status: Review["status"]) {
  try {
    await adminDb.collection("reviews").doc(id).update({ status });
    return { success: true };
  } catch (err: any) {
    console.error("updateReviewStatusAction error:", err);
    return { success: false, error: err.message };
  }
}

export async function deleteReviewAction(id: string) {
  try {
    await adminDb.collection("reviews").doc(id).delete();
    return { success: true };
  } catch (err: any) {
    console.error("deleteReviewAction error:", err);
    return { success: false, error: err.message };
  }
}

export async function createManualReviewAction(data: Partial<Review>) {
  try {
    const reviewData = {
      ...data,
      status: "approved",
      isAdminPost: true,
      createdAt: Date.now(),
    };
    await adminDb.collection("reviews").add(reviewData);
    return { success: true };
  } catch (err: any) {
    console.error("createManualReviewAction error:", err);
    return { success: false, error: err.message };
  }
}

export async function getApprovedReviewsAction(productId: string) {
  try {
    const snapshot = await adminDb.collection("reviews")
      .where("productId", "==", productId)
      .where("status", "==", "approved")
      .get();
    
    const reviews = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Review[];
    
    return { success: true, reviews };
  } catch (err: any) {
    console.error("getApprovedReviewsAction error:", err);
    return { success: false, error: err.message };
  }
}

export async function getPendingReviewCountAction() {
  try {
    const snapshot = await adminDb.collection("reviews")
      .where("status", "==", "pending")
      .get();
    return { success: true, count: snapshot.size };
  } catch (err: any) {
    console.error("getPendingReviewCountAction error:", err);
    return { success: false, error: err.message };
  }
}

export async function getAllReviewsAction() {
  try {
    const snapshot = await adminDb.collection("reviews").orderBy("createdAt", "desc").get();
    const reviews = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Review[];
    return { success: true, reviews };
  } catch (err: any) {
    console.error("getAllReviewsAction error:", err);
    return { success: false, error: err.message };
  }
}

export async function checkProductPurchaseAction(userId: string, productId: string) {
  try {
    const snapshot = await adminDb.collection("orders")
      .where("userId", "==", userId)
      .where("status", "in", ["completed", "delivered", "paid"])
      .get();
    
    const hasPurchased = snapshot.docs.some(doc => {
      const items = doc.data().items || [];
      return items.some((item: any) => item.productId === productId);
    });
    
    return { success: true, hasPurchased };
  } catch (err: any) {
    console.error("checkProductPurchaseAction error:", err);
    return { success: false, error: err.message };
  }
}

export async function replyToReviewAction(reviewId: string, reply: string) {
  try {
    await adminDb.collection("reviews").doc(reviewId).update({
      adminReply: reply,
      adminReplyAt: Date.now()
    });
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function markReviewHelpfulAction(reviewId: string) {
  try {
    const admin = await import("firebase-admin");
    await adminDb.collection("reviews").doc(reviewId).update({
      helpfulCount: admin.firestore.FieldValue.increment(1)
    });
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
