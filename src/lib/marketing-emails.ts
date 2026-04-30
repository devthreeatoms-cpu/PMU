import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = "PMU SUPPLY <support@pmusupplies.in>";
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://pmu-phi.vercel.app";

/**
 * Reuses the branding logic but for marketing purposes.
 */
const MarketingEmailWrapper = (content: string, previewText?: string) => `
  <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6; background-color: #000;">
    ${previewText ? `<div style="display: none; max-height: 0px; overflow: hidden;">${previewText}</div>` : ""}
    
    <!-- Hero Header -->
    <div style="padding: 60px 40px; text-align: center; background: linear-gradient(135deg, #1a1a1a 0%, #000 100%);">
      <h1 style="color: #C9A84C; margin: 0; font-size: 32px; letter-spacing: 6px; text-transform: uppercase; font-weight: 900;">PMU SUPPLY</h1>
      <p style="color: #fff; margin-top: 15px; font-size: 12px; letter-spacing: 3px; text-transform: uppercase; opacity: 0.8;">The Artist's Standard</p>
    </div>
    
    <!-- Body -->
    <div style="padding: 0 0 50px 0; background-color: #fff;">
      ${content}
    </div>

    <!-- Footer -->
    <div style="padding: 50px 40px; text-align: center; font-size: 11px; color: #666; background-color: #000;">
      <div style="margin-bottom: 25px;">
        <a href="${BASE_URL}/products" style="color: #C9A84C; text-decoration: none; margin: 0 15px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">New Arrivals</a>
        <a href="${BASE_URL}/profile" style="color: #C9A84C; text-decoration: none; margin: 0 15px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">My Studio</a>
      </div>
      <p style="margin: 5px 0; color: #999;">© 2026 PMU SUPPLY. All rights reserved.</p>
      <p style="margin: 5px 0; color: #555;">You are receiving this because you are part of our professional artist community.</p>
      <p style="margin-top: 20px; color: #C9A84C; font-style: italic;">Elevating the Art of Permanent Makeup.</p>
      <div style="margin-top: 30px; border-top: 1px solid #222; padding-top: 20px;">
        <a href="${BASE_URL}/profile" style="color: #444; text-decoration: underline;">Unsubscribe from elite updates</a>
      </div>
    </div>
  </div>
`;

export async function sendNewProductLaunchEmail(emails: string[], product: any) {
  const content = `
    <div style="padding: 50px 40px; text-align: center;">
      <span style="background-color: #C9A84C; color: #000; padding: 6px 15px; border-radius: 100px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">NEW ARRIVAL</span>
      <h2 style="font-size: 32px; font-weight: 800; color: #000; margin: 20px 0 10px 0;">${product.name}</h2>
      <p style="font-size: 16px; color: #666; font-style: italic; margin-bottom: 30px;">The next evolution in professional PMU technology is here.</p>
      
      ${product.image ? `<img src="${product.image}" alt="${product.name}" style="width: 100%; max-width: 400px; border-radius: 8px; margin-bottom: 30px; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">` : ""}
      
      <p style="font-size: 15px; color: #444; line-height: 1.8; margin-bottom: 35px;">
        Designed for artists who refuse to compromise on precision. ${product.description || "Experience the difference of world-class engineering."}
      </p>

      <a href="${BASE_URL}/products/${product.id}" style="background-color: #000; color: #fff; padding: 20px 45px; text-decoration: none; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 3px; display: inline-block; border-radius: 4px; box-shadow: 0 10px 20px rgba(0,0,0,0.15);">Acquire Now</a>
    </div>
  `;

  try {
    // Note: Resend allows sending to multiple recipients at once
    await resend.emails.send({
      from: FROM_EMAIL,
      to: emails,
      subject: `New Asset Launch: ${product.name} | PMU SUPPLY`,
      html: MarketingEmailWrapper(content, `The ${product.name} has arrived. Elevate your craft with our newest professional asset.`)
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: err };
  }
}

export async function sendSaleAnnouncementEmail(emails: string[], saleName: string, discount: string, code?: string) {
  const content = `
    <div style="padding: 60px 40px; text-align: center; background-color: #fafafa;">
      <h2 style="font-size: 42px; font-weight: 900; color: #000; margin: 0; text-transform: uppercase; letter-spacing: -1px;">${saleName}</h2>
      <div style="height: 4px; width: 60px; background-color: #C9A84C; margin: 25px auto;"></div>
      <p style="font-size: 20px; color: #C9A84C; font-weight: 700; text-transform: uppercase; letter-spacing: 4px;">Save ${discount}</p>
      
      <p style="font-size: 15px; color: #666; margin: 30px 0; line-height: 1.8;">
        Upgrade your studio with the world's finest PMU assets. For a limited time, enjoy exclusive artist pricing on our entire collection.
      </p>

      ${code ? `
        <div style="border: 1px dashed #C9A84C; padding: 20px; display: inline-block; margin-bottom: 35px;">
          <p style="margin: 0 0 5px 0; font-size: 10px; color: #999; text-transform: uppercase; letter-spacing: 1px;">Access Code</p>
          <p style="margin: 0; font-size: 24px; font-weight: 800; font-family: monospace; letter-spacing: 2px;">${code}</p>
        </div>
      ` : ""}

      <div style="text-align: center;">
        <a href="${BASE_URL}/products" style="background-color: #000; color: #fff; padding: 20px 45px; text-decoration: none; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 3px; display: inline-block; border-radius: 4px;">Enter the Sale</a>
      </div>
    </div>
  `;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: emails,
      subject: `${saleName} | Exclusive Artist Access at PMU SUPPLY`,
      html: MarketingEmailWrapper(content, `Save ${discount} during the ${saleName}. Elite professional assets now at exclusive pricing.`)
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: err };
  }
}

export async function sendFlashSaleEmail(emails: string[], duration: string, discount: string) {
  const content = `
    <div style="padding: 60px 40px; text-align: center; color: #fff; background-color: #000;">
      <div style="display: inline-block; border: 2px solid #ef4444; color: #ef4444; padding: 5px 15px; border-radius: 100px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 25px;">
        TIME SENSITIVE
      </div>
      <h2 style="font-size: 48px; font-weight: 900; margin: 0; text-transform: uppercase; letter-spacing: -2px;">FLASH SALE</h2>
      <p style="font-size: 24px; color: #C9A84C; font-weight: 700; margin: 15px 0;">${discount} OFF EVERYTHING</p>
      
      <div style="margin: 40px auto; max-width: 300px; border: 1px solid #333; padding: 20px;">
        <p style="margin: 0; font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 2px;">ENDS IN</p>
        <p style="margin: 10px 0 0 0; font-size: 28px; font-weight: 700; color: #fff;">${duration}</p>
      </div>

      <p style="font-size: 14px; color: #888; margin-bottom: 40px;">No code needed. Prices adjusted at checkout. This offer will not be repeated.</p>

      <a href="${BASE_URL}/products" style="background-color: #C9A84C; color: #000; padding: 20px 45px; text-decoration: none; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 3px; display: inline-block; border-radius: 4px;">Claim Your Assets</a>
    </div>
  `;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: emails,
      subject: `FLASH SALE: ${discount} Off Elite Assets | ${duration} Only`,
      html: MarketingEmailWrapper(content, `The PMU SUPPLY Flash Sale is LIVE. ${discount} off everything for the next ${duration}.`)
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: err };
  }
}
