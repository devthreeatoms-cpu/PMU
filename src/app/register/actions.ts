"use server";

import { sendWelcomeEmail, sendEmailVerification } from "@/lib/email";
import { adminAuth } from "@/lib/firebase-admin";

export async function onUserRegisteredAction(email: string, name: string) {
  try {
    // 1. Send Welcome Email
    await sendWelcomeEmail(email, name);
    
    // 2. Generate and Send Email Verification Link
    try {
      const link = await adminAuth.generateEmailVerificationLink(email, {
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://pmu-phi.vercel.app'}/login`
      });
      await sendEmailVerification(email, link);
    } catch (verifErr) {
      console.error("Failed to send verification email:", verifErr);
    }
    
    return { success: true };
  } catch (err: any) {
    console.error("onUserRegisteredAction error:", err);
    return { success: false, error: err.message };
  }
}
