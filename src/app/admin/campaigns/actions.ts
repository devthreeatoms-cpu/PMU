"use server";

import { adminDb } from "@/lib/firebase-admin";
import { 
  sendSaleAnnouncementEmail, 
  sendFlashSaleEmail 
} from "@/lib/marketing-emails";

export async function sendSaleCampaignAction(saleName: string, discount: string, code: string) {
  try {
    const usersSnapshot = await adminDb.collection("users").get();
    const emails = usersSnapshot.docs
      .map(doc => doc.data().email)
      .filter(email => email && typeof email === 'string');

    if (emails.length === 0) return { success: false, error: "No users found" };

    // Resend allows max 50 recipients per request. We'll chunk them.
    const CHUNK_SIZE = 50;
    const chunks = [];
    for (let i = 0; i < emails.length; i += CHUNK_SIZE) {
      chunks.push(emails.slice(i, i + CHUNK_SIZE));
    }

    for (const chunk of chunks) {
      await sendSaleAnnouncementEmail(chunk, saleName, discount, code);
    }
    
    // Create coupon in database if code exists
    if (code) {
      try {
        const isPercentage = discount.includes('%');
        const numericValue = parseFloat(discount.replace(/[^0-9.]/g, '')) || 0;
        
        await adminDb.collection("coupons").add({
          code: code.toUpperCase(),
          type: isPercentage ? 'percentage' : 'flat',
          value: numericValue,
          description: `Campaign: ${saleName}`,
          isActive: true,
          usageLimit: null, // null for unlimited
          usageCount: 0,
          expiryDate: Date.now() + (30 * 24 * 60 * 60 * 1000), // Default 30 days
          createdAt: Date.now()
        });
      } catch (couponErr) {
        console.error("Failed to create coupon from campaign:", couponErr);
      }
    }

    return { success: true };
  } catch (err: any) {
    console.error("sendSaleCampaignAction error:", err);
    return { success: false, error: err.message };
  }
}

export async function sendFlashSaleCampaignAction(duration: string, discount: string) {
  try {
    const usersSnapshot = await adminDb.collection("users").get();
    const emails = usersSnapshot.docs
      .map(doc => doc.data().email)
      .filter(email => email && typeof email === 'string');

    if (emails.length === 0) return { success: false, error: "No users found" };

    // Resend allows max 50 recipients per request.
    const CHUNK_SIZE = 50;
    const chunks = [];
    for (let i = 0; i < emails.length; i += CHUNK_SIZE) {
      chunks.push(emails.slice(i, i + CHUNK_SIZE));
    }

    for (const chunk of chunks) {
      await sendFlashSaleEmail(chunk, duration, discount);
    }

    return { success: true };
  } catch (err: any) {
    console.error("sendFlashSaleCampaignAction error:", err);
    return { success: false, error: err.message };
  }
}
