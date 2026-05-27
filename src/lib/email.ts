import { Resend } from "resend";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

let _resend: Resend | null = null;
function getResend() {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("RESEND_API_KEY is not configured");
    _resend = new Resend(key);
  }
  return _resend;
}
const FROM_EMAIL = "PMU SUPPLY <support@pmusupplies.in>";
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
  const { id, total, items, shippingAddress } = order;

  const itemsHtml = items.map((item: any) => `
    <tr>
      <td style="padding: 15px 0; border-bottom: 1px solid #f0f0f0;">
        <p style="margin: 0; font-size: 14px; font-weight: 700; color: #1a1a1a;">${item.productName}</p>
        <p style="margin: 4px 0 0; font-size: 11px; color: #888; text-transform: uppercase;">Qty: ${item.quantity}</p>
      </td>
      <td style="padding: 15px 0; border-bottom: 1px solid #f0f0f0; text-align: right;">
        <p style="margin: 0; font-size: 14px; font-weight: 700; color: #000;">₹${item.priceAtPurchase.toFixed(2)}</p>
      </td>
    </tr>
  `).join("");

  const content = `
    <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 30px;">
      <h2 style="font-size: 22px; font-weight: 300; margin: 0;">Order <span style="color: #C9A84C; font-weight: 700;">Confirmed</span></h2>
      <span style="font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 1px;">#${id}</span>
    </div>

    <p style="font-size: 14px; color: #666; margin-bottom: 30px;">Your professional order has been received and is being processed with the highest standards of clinical precision.</p>

    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr>
          <th style="text-align: left; font-size: 10px; text-transform: uppercase; color: #999; padding-bottom: 15px; border-bottom: 2px solid #000;">Asset Details</th>
          <th style="text-align: right; font-size: 10px; text-transform: uppercase; color: #999; padding-bottom: 15px; border-bottom: 2px solid #000;">Investment</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
      <tfoot>
        <tr>
          <td style="padding-top: 25px; font-size: 14px; font-weight: 400; color: #666;">Subtotal</td>
          <td style="padding-top: 25px; font-size: 14px; font-weight: 400; text-align: right; color: #666;">₹${total.toFixed(2)}</td>
        </tr>
        <tr>
          <td style="padding-top: 10px; font-size: 16px; font-weight: 800; color: #000; text-transform: uppercase;">Total Amount</td>
          <td style="padding-top: 10px; font-size: 20px; font-weight: 800; text-align: right; color: #C9A84C;">₹${total.toFixed(2)}</td>
        </tr>
      </tfoot>
    </table>

    <div style="margin-top: 45px; padding: 25px; background-color: #000; color: #fff; border-radius: 4px;">
      <h3 style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 15px 0; color: #C9A84C;">Delivery Logistics</h3>
      <p style="font-size: 13px; color: #fff; margin: 0; opacity: 0.9; line-height: 1.8;">
        ${shippingAddress.firstName} ${shippingAddress.lastName}<br>
        ${shippingAddress.address}<br>
        ${shippingAddress.city}, ${shippingAddress.zipCode}<br>
        ${shippingAddress.phone}
      </p>
    </div>
  `;

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: [shippingAddress.email],
      subject: `Order Confirmed | PMU SUPPLY #${id}`,
      html: ProfessionalEmailWrapper(content, "Your PMU SUPPLY order has been confirmed and is being processed.")
    });
    return { success: true };
  } catch (error) {
    console.error("Resend Order Update Error:", error);
    return { success: false, error };
  }
}

export async function sendInvoiceEmail(order: any) {
  const { id, total, items, shippingAddress, razorpayPaymentId, paymentVerifiedAt } = order;

  // 1. Generate PDF Invoice
  let pdfBase64 = "";
  try {
    const doc = new jsPDF() as any;
    const date = new Date(paymentVerifiedAt || Date.now()).toLocaleDateString();

    // Header Branding
    doc.setFillColor(0, 0, 0);
    doc.rect(0, 0, 210, 40, "F");
    doc.setTextColor(201, 168, 76); // Brand Gold
    doc.setFontSize(24);
    doc.text("PMU SUPPLY", 105, 20, { align: "center" });
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text("ELITE PROFESSIONAL EQUIPMENT", 105, 28, { align: "center" });

    // Invoice Info
    const invoiceNo = `INV-${id.substring(0, 8).toUpperCase()}`;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.text("INVOICE", 20, 55);
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`Date: ${date}`, 190, 55, { align: "right" });
    doc.text(`Invoice #: ${invoiceNo}`, 190, 60, { align: "right" });

    // Billing Info
    doc.setTextColor(150, 150, 150);
    doc.text("BILL TO:", 20, 75);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.text(`${shippingAddress.firstName} ${shippingAddress.lastName}`, 20, 82);
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text(`${shippingAddress.address}`, 20, 88);
    doc.text(`${shippingAddress.city}, ${shippingAddress.zipCode}`, 20, 93);
    doc.text(`${shippingAddress.email}`, 20, 98);

    // Payment Info
    doc.setTextColor(150, 150, 150);
    doc.text("PAYMENT METHOD:", 120, 75);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text("Razorpay Online", 120, 82);
    doc.setTextColor(201, 168, 76);
    doc.text(`ID: ${razorpayPaymentId || 'N/A'}`, 120, 88);

    // Table Header
    let yPos = 110;
    doc.setFillColor(0, 0, 0);
    doc.rect(20, yPos - 7, 170, 10, 'F');
    doc.setTextColor(201, 168, 76);
    doc.setFontSize(10);
    doc.text("Description", 25, yPos);
    doc.text("Qty", 120, yPos);
    doc.text("Price", 145, yPos);
    doc.text("Total", 170, yPos);
    
    yPos += 15;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    
    items.forEach((item: any) => {
      const name = (item.productName || item.product?.name || "Product").substring(0, 45);
      const qty = item.quantity.toString();
      const price = `INR ${(item.priceAtPurchase || item.product?.price || 0).toFixed(2)}`;
      const itemTotal = `INR ${((item.priceAtPurchase || item.product?.price || 0) * item.quantity).toFixed(2)}`;
      
      doc.text(name, 25, yPos);
      doc.text(qty, 122, yPos);
      doc.text(price, 145, yPos);
      doc.text(itemTotal, 170, yPos);
      yPos += 10;
    });

    const finalY = yPos > 150 ? yPos : 150;

    // Totals Section (Re-aligned to prevent overlap)
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    
    // Subtotal
    const subtotalVal = order.subtotal || total - (order.shippingAmount || 0) - (order.taxAmount || 0);
    doc.text("Subtotal:", 130, finalY + 15);
    doc.text(`INR ${subtotalVal.toFixed(2)}`, 190, finalY + 15, { align: "right" });
    
    // Shipping
    doc.text("Shipping:", 130, finalY + 22);
    doc.text(`INR ${(order.shippingAmount || 0).toFixed(2)}`, 190, finalY + 22, { align: "right" });

    // Tax
    doc.text("Tax (GST):", 130, finalY + 29);
    doc.text(`INR ${(order.taxAmount || 0).toFixed(2)}`, 190, finalY + 29, { align: "right" });

    // Discounts
    if (order.discountAmount > 0) {
      doc.setTextColor(34, 197, 94);
      doc.text("Incentives:", 130, finalY + 36);
      doc.text(`-INR ${order.discountAmount.toFixed(2)}`, 190, finalY + 36, { align: "right" });
    }

    // Grand Total (Clearer spacing)
    doc.setTextColor(201, 168, 76);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("GRAND TOTAL:", 125, finalY + 47);
    doc.text(`INR ${total.toFixed(2)}`, 190, finalY + 47, { align: "right" });
    doc.setFont("helvetica", "normal");

    // Footer Note
    doc.setFontSize(8);
    doc.setTextColor(180, 180, 180);
    doc.text("Precision in Every Stroke. Quality in Every Asset.", 105, 280, { align: "center" });
    doc.text("© 2026 PMU SUPPLY. ALL RIGHTS RESERVED.", 105, 285, { align: "center" });

    const pdfOutput = doc.output("arraybuffer");
    pdfBase64 = Buffer.from(pdfOutput).toString("base64");
  } catch (pdfErr) {
    console.error("PDF Generation Error:", pdfErr);
  }

  const content = `
    <h2 style="font-size: 22px; font-weight: 300; margin-bottom: 20px;">Your Official <span style="color: #C9A84C; font-weight: 700;">Invoice</span></h2>
    <p style="font-size: 15px; color: #444; margin-bottom: 30px;">Thank you for your professional acquisition. Please find your official invoice attached to this email in PDF format for your records.</p>
    
    <div style="background-color: #fafafa; border: 1px solid #eee; border-radius: 8px; padding: 25px; text-align: center;">
      <p style="margin: 0; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px;">Order Reference</p>
      <h3 style="margin: 10px 0; font-size: 20px; color: #000; font-weight: 700;">#${id}</h3>
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
      subject: `Official Invoice | PMU SUPPLY Order #${id}`,
      html: ProfessionalEmailWrapper(content, `Invoice for your order #${id} from PMU SUPPLY.`),
    };

    if (pdfBase64) {
      emailOptions.attachments = [
        {
          filename: `Invoice-PMU-${id.slice(-8).toUpperCase()}.pdf`,
          content: Buffer.from(pdfBase64, 'base64'),
          contentType: 'application/pdf',
        }
      ];
    }

    await getResend().emails.send(emailOptions);
    return { success: true };
  } catch (error) {
    console.error("Resend Order Update Error:", error);
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
