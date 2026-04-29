import { 
  sendNewProductLaunchEmail, 
  sendSaleAnnouncementEmail, 
  sendFlashSaleEmail 
} from "../lib/marketing-emails";

/**
 * TEST SCRIPT: Marketing Emails
 * Run this to verify your marketing templates are working.
 * Replace 'your-email@example.com' with your actual test email.
 */
async function testMarketingEmails() {
  const testEmail = "lenovo@example.com"; // REPLACE WITH YOUR EMAIL
  console.log(`Starting Marketing Email Tests for: ${testEmail}...`);

  // 1. Test Product Launch
  console.log("- Testing Product Launch...");
  await sendNewProductLaunchEmail([testEmail], {
    id: "test-product-123",
    name: "Elite Rotary Machine X1",
    description: "The most precise PMU machine ever engineered, featuring custom stroke adjustment and whisper-quiet operation.",
    image: "https://images.unsplash.com/photo-1598911583474-0157ef74abd0?auto=format&fit=crop&q=80&w=800"
  });

  // 2. Test Sale Announcement
  console.log("- Testing Sale Announcement...");
  await sendSaleAnnouncementEmail(
    [testEmail], 
    "SUMMER ARTIST SERIES", 
    "20%", 
    "SUMMER20"
  );

  // 3. Test Flash Sale
  console.log("- Testing Flash Sale...");
  await sendFlashSaleEmail(
    [testEmail], 
    "4 HOURS", 
    "30%"
  );

  console.log("Marketing Email Tests Completed. Please check your inbox!");
}

testMarketingEmails().catch(console.error);
