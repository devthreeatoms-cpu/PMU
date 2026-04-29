import { adminDb } from "./firebase-admin";

export type NotificationType = "review" | "order";

export interface AdminNotification {
  id?: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string;
  isRead: boolean;
  createdAt: number;
}

export async function createAdminNotification(data: Omit<AdminNotification, "isRead" | "createdAt">) {
  try {
    const notification: AdminNotification = {
      ...data,
      isRead: false,
      createdAt: Date.now(),
    };
    await adminDb.collection("notifications").add(notification);
    return { success: true };
  } catch (err: any) {
    console.error("Error creating notification:", err);
    return { success: false, error: err.message };
  }
}
