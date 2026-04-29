"use server";

import { adminDb } from "@/lib/firebase-admin";
import { AdminNotification } from "@/lib/notifications";

export async function getNotificationsAction() {
  try {
    const snapshot = await adminDb.collection("notifications")
      .orderBy("createdAt", "desc")
      .limit(10)
      .get();
    
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as AdminNotification[];
    
    return { success: true, notifications };
  } catch (err: any) {
    console.error("Error fetching notifications:", err);
    return { success: false, error: err.message };
  }
}

export async function getUnreadNotificationsCountAction() {
  try {
    const snapshot = await adminDb.collection("notifications")
      .where("isRead", "==", false)
      .get();
    
    return { success: true, count: snapshot.size };
  } catch (err: any) {
    console.error("Error fetching unread count:", err);
    return { success: false, error: err.message };
  }
}

export async function markNotificationAsReadAction(id: string) {
  try {
    await adminDb.collection("notifications").doc(id).update({
      isRead: true
    });
    return { success: true };
  } catch (err: any) {
    console.error("Error marking notification as read:", err);
    return { success: false, error: err.message };
  }
}

export async function markAllNotificationsAsReadAction() {
  try {
    const snapshot = await adminDb.collection("notifications")
      .where("isRead", "==", false)
      .get();
    
    const batch = adminDb.batch();
    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, { isRead: true });
    });
    
    await batch.commit();
    return { success: true };
  } catch (err: any) {
    console.error("Error marking all as read:", err);
    return { success: false, error: err.message };
  }
}
