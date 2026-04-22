"use server";

import { adminDb } from "@/lib/firebase-admin";
import { ReferralSettings, UserProfile } from "@/lib/types";

export async function getReferralSettingsAction() {
  try {
    const docRef = adminDb.collection("siteSettings").doc("referral");
    const docSnap = await docRef.get();
    if (docSnap.exists) {
      return { success: true, settings: docSnap.data() as ReferralSettings };
    }
    return { success: true, settings: null };
  } catch (err: any) {
    console.error("getReferralSettingsAction error:", err);
    return { success: false, error: err.message };
  }
}

export async function updateReferralSettingsAction(settings: ReferralSettings) {
  try {
    await adminDb.collection("siteSettings").doc("referral").set(settings, { merge: true });
    return { success: true };
  } catch (err: any) {
    console.error("updateReferralSettingsAction error:", err);
    return { success: false, error: err.message };
  }
}

export async function getReferralAuditDataAction() {
  try {
    const snapshot = await adminDb.collection("users").get();
    const users = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() })) as UserProfile[];
    
    const referrers = users.filter(u => (u.totalReferralEarnings || 0) > 0 || users.some(r => r.referredBy === u.uid));
    
    const data = referrers.map(referrer => {
      const directReferrals = users.filter(u => u.referredBy === referrer.uid);
      return {
        uid: referrer.uid,
        displayName: referrer.displayName,
        referralCode: referrer.referralCode,
        referralCount: directReferrals.length,
        conversionCount: directReferrals.filter(u => (u.points || 0) > 0).length,
        earnings: referrer.totalReferralEarnings || 0,
        status: (referrer as any).status || 'active',
        referrals: directReferrals.map(r => ({
          uid: r.uid,
          displayName: r.displayName,
          createdAt: r.createdAt
        }))
      };
    });
    
    return { success: true, networkData: data };
  } catch (err: any) {
    console.error("getReferralAuditDataAction error:", err);
    return { success: false, error: err.message };
  }
}
