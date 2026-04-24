"use server";

import { adminDb } from "@/lib/firebase-admin";
import { UserProfile, PointTransaction } from "@/lib/types";
import { FieldValue } from "firebase-admin/firestore";

export async function getAllUsersAction() {
  try {
    const snapshot = await adminDb.collection("users").get();
    const users = snapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    })) as UserProfile[];
    
    return { success: true, users };
  } catch (err: any) {
    console.error("getAllUsersAction error:", err);
    return { success: false, error: err.message };
  }
}

export async function adjustUserPointsAction(userId: string, pointsDelta: number, reason: string, adminId: string = "SYSTEM") {
  try {
    const batch = adminDb.batch();
    const userRef = adminDb.collection("users").doc(userId);
    const transactionRef = userRef.collection("transactions").doc();

    batch.update(userRef, { 
      points: FieldValue.increment(pointsDelta)
    });

    const transaction = {
      id: transactionRef.id,
      amount: pointsDelta,
      type: pointsDelta > 0 ? 'earn' : 'redeem',
      reason,
      adminId,
      createdAt: Date.now()
    };

    batch.set(transactionRef, transaction);
    await batch.commit();
    
    return { success: true };
  } catch (err: any) {
    console.error("adjustUserPointsAction error:", err);
    return { success: false, error: err.message };
  }
}

export async function getUserTransactionsAction(userId: string) {
  try {
    const snapshot = await adminDb.collection("users")
      .doc(userId)
      .collection("transactions")
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();
      
    const transactions = snapshot.docs.map(doc => ({
      ...doc.data()
    })) as PointTransaction[];
    
    return { success: true, transactions };
  } catch (err: any) {
    console.error("getUserTransactionsAction error:", err);
    return { success: false, error: err.message };
  }
}

export async function setUserRoleAction(userId: string, role: 'admin' | 'customer') {
  try {
    await adminDb.collection("users").doc(userId).update({ role });
    return { success: true };
  } catch (err: any) {
    console.error("setUserRoleAction error:", err);
    return { success: false, error: err.message };
  }
}

export async function registerUserAction(data: { email: string; displayName: string; role: string }) {
  try {
    const { adminAuth } = await import("@/lib/firebase-admin");
    const userRecord = await adminAuth.createUser({
      email: data.email,
      displayName: data.displayName,
      password: "PMU" + Math.random().toString(36).slice(-8), // Temporary password
    });

    await adminDb.collection("users").doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: data.email,
      displayName: data.displayName,
      role: data.role || "customer",
      createdAt: Date.now(),
      storeCredit: 0
    });

    return { success: true, uid: userRecord.uid };
  } catch (err: any) {
    console.error("registerUserAction error:", err);
    return { success: false, error: err.message };
  }
}

