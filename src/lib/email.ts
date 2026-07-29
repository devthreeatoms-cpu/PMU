import { Resend } from "resend";
import { buildInvoicePdfBase64, getInvoiceFilename, getInvoiceNumber } from "@/lib/invoice";

let _resend: Resend | null = null;
function getResend() {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("RESEND_API_KEY is not configured");
    _resend = new Resend(key);
  }
  return _resend;
}
const FROM_EMAIL = "PMU SUPPLY <pmusuppliesindia@gmail.com>";
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://pmu-phi.vercel.app";

/**
 * Premium Email Wrapper for PMU SUPPLY
 * Ensures a consistent "Elite Professional" aesthetic across all communications.
 */
const ProfessionalEmailWrapper = (content: string, previewText?: string) => `
  <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6; background-color: #f9f9f9;">
    ${previewText ? `<div style="display: none; max-height: 0px; overflow: hidden;">${previewText}</div>` : ""}
    
    <!-- Header -->
    <div style="background-color: #000; padding: 40px; text-align: center; border-bottom: 4px solid #C9A84C;">
      <h1 style="color: #C9A84C; margin: 0; font-size: 28px; letter-spacing: 4px; text-transform: uppercase; font-weight: 800;">PMU SUPPLY</h1>
      <p style="color: #fff; margin-top: 10px; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; opacity: 0.7;">Elite Professional Equipment</p>
    </div>
    
    <!-- Main Content -->
    <div style="padding: 50px 40px; background-color: #fff; border: 1px solid #eee; border-top: none;">
      ${content}
    </div>

    <!-- Footer -->
    <div style="padding: 40px; text-align: center; font-size: 11px; color: #999; background-color: #f9f9f9;">
      <div style="margin-bottom: 20px;">
        <a href="${BASE_URL}" style="color: #C9A84C; text-decoration: none; margin: 0 10px; font-weight: 700; text-transform: uppercase;">Store</a>
        <a href="${BASE_URL}/profile" style="color: #C9A84C; text-decoration: none; margin: 0 10px; font-weight: 700; text-transform: uppercase;">My Account</a>
        <a href="${BASE_URL}/pages/contact" style="color: #C9A84C; text-decoration: none; margin: 0 10px; font-weight: 700; text-transform: uppercase;">Support</a>
      </div>
      <p style="margin: 5px 0;">© 2026 PMU SUPPLY. All rights reserved.</p>
      <p style="margin: 5px 0;">You are receiving this professional communication because of your activity on PMU SUPPLY.</p>
      <div style="margin-top: 20px; border-top: 1px solid #eee; padding-top: 20px;">
        <p style="font-style: italic;">"Precision in Every Stroke. Quality in Every Asset."</p>
      </div>
    </div>
  </div>
`;

// 1. Account & Onboarding Emails

export async function sendWelcomeEmail(userEmail: string, userName: string) {
  const content = `
    <h2 style="font-size: 24px; font-weight: 300; color: #000; margin-bottom: 25px;">Welcome to the Elite Circle, <span style="color: #C9A84C; font-weight: 700;">${userName}</span>.</h2>
    <p style="font-size: 15px; color: #444; margin-bottom: 20px;">Your account has been successfully established at PMU SUPPLY. You now have access to the world's most precise permanent makeup assets.</p>
    
    <div style="background-color: #fafafa; border: 1px dashed #C9A84C; border-radius: 12px; padding: 30px; text-align: center; margin: 35px 0;">
      <p style="margin: 0; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px;">Artist Initiation Gift</p>
      <h3 style="margin: 10px 0; font-size: 32px; color: #000; font-weight: 800;">10% OFF</h3>
      <p style="margin: 0; font-size: 14px; color: #444;">Use code: <span style="background-color: #000; color: #C9A84C; padding: 5px 12px; border-radius: 4px; font-family: monospace; font-weight: 700; font-size: 18px;">WELCOME10</span></p>
      <p style="margin-top: 15px; font-size: 11px; color: #999;">Valid on your first professional acquisition.</p>
    </div>

    <div style="text-align: center; margin-top: 40px;">
      <a href="${BASE_URL}/products" style="background-color: #000; color: #fff; padding: 18px 35px; text-decoration: none; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; display: inline-block; border-radius: 4px;">Explore Catalog</a>
    </div>
  `;

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: [userEmail],
      subject: "Welcome to PMU SUPPLY | Your Artist Initiation Inside",
      html: ProfessionalEmailWrapper(content, "Welcome to PMU SUPPLY! Your 10% off initiation gift is waiting inside.")
    });
    return { success: true };
  } catch (err) {
    console.error("Welcome Email Error:", err);
    return { success: false, error: err };
  }
}

export async function sendEmailVerification(userEmail: string, verificationUrl: string) {
  const content = `
    <h2 style="font-size: 20px; font-weight: 600; color: #000; margin-bottom: 20px;">Verify Your Professional Identity</h2>
    <p style="font-size: 14px; color: #666; margin-bottom: 30px;">To ensure the security of your professional account and enable purchasing, please verify your email address.</p>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="${verificationUrl}" style="background-color: #C9A84C; color: #000; padding: 18px 35px; text-decoration: none; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; display: inline-block; border-radius: 4px; box-shadow: 0 4px 12px rgba(201, 168, 76, 0.2);">Verify Account</a>
    </div>
    
    <p style="font-size: 12px; color: #999; text-align: center;">This link will expire in 24 hours. If you did not create an account, please ignore this email.</p>
  `;

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: [userEmail],
      subject: "Verify your PMU SUPPLY identity",
      html: ProfessionalEmailWrapper(content)
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: err };
  }
}

// 2. Transactional Emails

export async function sendOrderConfirmationEmail(order: any) {
  const { shippingAddress } = order;
  const invoiceNo = getInvoiceNumber(order);
  const items = Array.isArray(order.items) ? order.items : [];

  const fmt = (v: unknown) => {
    const n = typeof v === "number" ? v : Number(v);
    return Number.isFinite(n)
      ? `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : "₹0.00";
  };

  const itemsHtml = items
    .map((item: any) => {
      const name = item.productName || item.product?.name || "Product";
      const qty = item.quantity || 1;
      const unit = item.priceAtPurchase ?? item.product?.salePrice ?? item.product?.price ?? 0;
      const variant = item.variantName ? `<p style="margin: 2px 0 0; font-size: 11px; color: #aaa;">${item.variantName}</p>` : "";
      return `
    <tr>
      <td style="padding: 15px 0; border-bottom: 1px solid #f0f0f0;">
        <p style="margin: 0; font-size: 14px; font-weight: 700; color: #1a1a1a;">${name}</p>
        ${variant}
        <p style="margin: 4px 0 0; font-size: 11px; color: #888; text-transform: uppercase;">Qty: ${qty}</p>
      </td>
      <td style="padding: 15px 0; border-bottom: 1px solid #f0f0f0; text-align: right;">
        <p style="margin: 0; font-size: 14px; font-weight: 700; color: #000;">${fmt(unit * qty)}</p>
      </td>
    </tr>`;
    })
    .join("");

  const subtotal = order.subtotal ?? items.reduce((s: number, i: any) => s + (i.totalPrice ?? (i.priceAtPurchase || 0) * (i.quantity || 1)), 0);
  const discount = order.discountAmount ?? order.couponDiscountAmount ?? 0;
  const tax = order.taxAmount ?? order.gstAmount ?? 0;
  const shipping = order.shippingAmount ?? 0;
  const convenience = order.convenienceFeeTotal ?? 0;
  const total = order.total ?? subtotal - discount + tax + shipping + convenience;

  const name = `${shippingAddress?.firstName || ""} ${shippingAddress?.lastName || ""}`.trim() || "Customer";

  const content = `
    <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 30px;">
      <h2 style="font-size: 22px; font-weight: 300; margin: 0;">Order <span style="color: #C9A84C; font-weight: 700;">Confirmed</span></h2>
      <span style="font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 1px;">${invoiceNo}</span>
    </div>

    <p style="font-size: 14px; color: #666; margin-bottom: 30px;">Thank you, ${name}. Your order has been received and is being prepared.</p>

    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr>
          <th style="text-align: left; font-size: 10px; text-transform: uppercase; color: #999; padding-bottom: 15px; border-bottom: 2px solid #000;">Item</th>
          <th style="text-align: right; font-size: 10px; text-transform: uppercase; color: #999; padding-bottom: 15px; border-bottom: 2px solid #000;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
      <tfoot>
        <tr>
          <td style="padding-top: 20px; font-size: 13px; color: #666;">Subtotal</td>
          <td style="padding-top: 20px; font-size: 13px; text-align: right; color: #666;">${fmt(subtotal)}</td>
        </tr>
        ${
          discount > 0
            ? `<tr>
          <td style="padding-top: 8px; font-size: 13px; color: #16a34a;">Discount${order.couponCode ? ` (${String(order.couponCode).toUpperCase()})` : ""}</td>
          <td style="padding-top: 8px; font-size: 13px; text-align: right; color: #16a34a;">- ${fmt(discount)}</td>
        </tr>`
            : ""
        }
        ${
          tax > 0
            ? `<tr>
          <td style="padding-top: 8px; font-size: 13px; color: #666;">GST / Tax</td>
          <td style="padding-top: 8px; font-size: 13px; text-align: right; color: #666;">${fmt(tax)}</td>
        </tr>`
            : ""
        }
        ${
          convenience > 0
            ? `<tr>
          <td style="padding-top: 8px; font-size: 13px; color: #666;">Convenience Fee</td>
          <td style="padding-top: 8px; font-size: 13px; text-align: right; color: #666;">${fmt(convenience)}</td>
        </tr>`
            : ""
        }
        <tr>
          <td style="padding-top: 14px; font-size: 16px; font-weight: 800; color: #000; text-transform: uppercase;">Total Amount</td>
          <td style="padding-top: 14px; font-size: 20px; font-weight: 800; text-align: right; color: #C9A84C;">${fmt(total)}</td>
        </tr>
      </tfoot>
    </table>

    <div style="margin-top: 45px; padding: 25px; background-color: #000; color: #fff; border-radius: 4px;">
      <h3 style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 15px 0; color: #C9A84C;">Delivery Address</h3>
      <p style="font-size: 13px; color: #fff; margin: 0; opacity: 0.9; line-height: 1.8;">
        ${name}<br>
        ${shippingAddress?.address || ""}<br>
        ${[shippingAddress?.city, shippingAddress?.zipCode].filter(Boolean).join(", ")}<br>
        ${shippingAddress?.phone || ""}
      </p>
    </div>
  `;

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: [shippingAddress.email],
      subject: `Order Confirmed | ${invoiceNo} | PMU SUPPLY`,
      html: ProfessionalEmailWrapper(content, "Your PMU SUPPLY order has been confirmed and is being processed."),
    });
    return { success: true };
  } catch (error) {
    console.error("Resend Order Confirmation Error:", error);
    return { success: false, error };
  }
}

export async function sendInvoiceEmail(order: any) {
  const { id, shippingAddress } = order;
  const invoiceNo = getInvoiceNumber(order);

  // 1. Generate PDF Invoice (shared builder — real values, clean format)
  let pdfBase64 = "";
  try {
    pdfBase64 = buildInvoicePdfBase64(order);
  } catch (pdfErr) {
    console.error("PDF Generation Error:", pdfErr);
  }

  const content = `
    <h2 style="font-size: 22px; font-weight: 300; margin-bottom: 20px;">Your Official <span style="color: #C9A84C; font-weight: 700;">Invoice</span></h2>
    <p style="font-size: 15px; color: #444; margin-bottom: 30px;">Thank you for your order. Please find your tax invoice attached to this email in PDF format for your records.</p>
    
    <div style="background-color: #fafafa; border: 1px solid #eee; border-radius: 8px; padding: 25px; text-align: center;">
      <p style="margin: 0; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px;">Invoice Number</p>
      <h3 style="margin: 10px 0; font-size: 20px; color: #000; font-weight: 700;">${invoiceNo}</h3>
      <p style="margin: 15px 0 0 0; font-size: 13px; color: #C9A84C; font-weight: 700;">📎 PDF Invoice Attached</p>
    </div>

    <div style="text-align: center; margin-top: 40px;">
      <a href="${BASE_URL}/profile" style="background-color: #000; color: #fff; padding: 15px 30px; text-decoration: none; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; display: inline-block; border-radius: 4px;">View Order in Studio</a>
    </div>
  `;

  try {
    const emailOptions: any = {
      from: FROM_EMAIL,
      to: [shippingAddress.email],
      subject: `Invoice ${invoiceNo} | PMU SUPPLY`,
      html: ProfessionalEmailWrapper(content, `Invoice ${invoiceNo} from PMU SUPPLY.`),
    };

    if (pdfBase64) {
      emailOptions.attachments = [
        {
          filename: getInvoiceFilename(order),
          content: Buffer.from(pdfBase64, "base64"),
          contentType: "application/pdf",
        },
      ];
    }

    await getResend().emails.send(emailOptions);
    return { success: true };
  } catch (error) {
    console.error("Resend Invoice Email Error:", error);
    return { success: false, error };
  }
}

export async function sendOrderStatusUpdateEmail(order: any) {
  const { id, status, shippingAddress } = order;
  const statusUpper = status.charAt(0).toUpperCase() + status.slice(1);

  let statusMessage = "Your order status has been updated.";
  let statusIcon = "📋";
  let statusColor = "#C9A84C";

  if (status === "processing") {
    statusMessage = "Our specialists are currently preparing your elite assets for dispatch.";
    statusIcon = "⚙️";
  } else if (status === "shipped") {
    statusMessage = "Your package has left our fulfillment center and is on its way to your clinic.";
    statusIcon = "🚚";
    statusColor = "#3b82f6";
  } else if (status === "delivered") {
    statusMessage = "Success! Your assets have been successfully delivered to your location.";
    statusIcon = "✅";
    statusColor = "#10b981";
  } else if (status === "cancelled") {
    statusMessage = "Your order has been cancelled. If this was unexpected, please contact our support desk.";
    statusIcon = "❌";
    statusColor = "#ef4444";
  }

  const content = `
    <div style="text-align: center; margin-bottom: 40px;">
      <div style="font-size: 50px; margin-bottom: 20px;">${statusIcon}</div>
      <h2 style="font-size: 26px; font-weight: 300; margin: 0; text-transform: uppercase; letter-spacing: 2px;">Order <span style="color: ${statusColor}; font-weight: 800;">${statusUpper}</span></h2>
      <p style="font-size: 15px; color: #666; margin-top: 15px;">${statusMessage}</p>
    </div>
    
    <div style="margin: 30px 0; padding: 30px; border: 2px solid #f4f4f4; border-radius: 12px; text-align: center;">
      <p style="margin: 0; font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 2px;">Identification Number</p>
      <p style="margin: 10px 0; font-size: 20px; font-weight: 700; color: #000;">${id}</p>
      <div style="display: inline-block; padding: 6px 15px; background-color: ${statusColor}; color: #fff; border-radius: 100px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-top: 10px;">
        Current Status: ${statusUpper}
      </div>
    </div>

    <div style="text-align: center; margin-top: 40px;">
      <a href="${BASE_URL}/profile" style="border: 2px solid #000; color: #000; padding: 15px 35px; text-decoration: none; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; display: inline-block; border-radius: 4px;">Track Live Status</a>
    </div>
  `;

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: [shippingAddress.email],
      subject: `Order Update | Your PMU SUPPLY Package is ${statusUpper}`,
      html: ProfessionalEmailWrapper(content, `Your order #${id} has been updated to ${statusUpper}.`)
    });
    return { success: true };
  } catch (error) {
    console.error("Resend Order Update Error:", error);
    return { success: false, error };
  }
}

export async function sendRefundConfirmationEmail(order: any, amount: number) {
  const content = `
    <div style="text-align: center; margin-bottom: 40px;">
      <div style="font-size: 50px; margin-bottom: 20px;">💰</div>
      <h2 style="font-size: 26px; font-weight: 300; margin: 0; text-transform: uppercase; letter-spacing: 2px;">Refund <span style="color: #10b981; font-weight: 800;">Processed</span></h2>
      <p style="font-size: 15px; color: #666; margin-top: 15px;">A refund has been successfully initiated for your order.</p>
    </div>

    <div style="background-color: #f0fdf4; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
      <p style="margin: 0; font-size: 11px; color: #166534; text-transform: uppercase; letter-spacing: 1px;">Refund Amount</p>
      <h3 style="margin: 10px 0; font-size: 32px; color: #166534; font-weight: 800;">₹${amount.toFixed(2)}</h3>
      <p style="margin: 0; font-size: 12px; color: #166534; opacity: 0.8;">Order: #${order.id}</p>
    </div>

    <p style="font-size: 13px; color: #666; text-align: center;">The amount should reflect in your professional account within 5-7 business days, depending on your financial institution.</p>
  `;

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: [order.shippingAddress.email],
      subject: `Refund Processed | PMU SUPPLY Order #${order.id}`,
      html: ProfessionalEmailWrapper(content)
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: err };
  }
}
