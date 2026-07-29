import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Shared invoice PDF builder for checkout, profile, admin, and email.
 * Accepts flexible order shapes and always renders human-readable values
 * (never raw undefined / technical-only fields as primary content).
 */

export type InvoiceLineItem = {
  productName?: string;
  product?: { name?: string; price?: number; salePrice?: number };
  variantName?: string | null;
  quantity?: number;
  priceAtPurchase?: number;
  totalPrice?: number;
};

export type InvoiceAddress = {
  firstName?: string;
  lastName?: string;
  email?: string;
  address?: string;
  city?: string;
  zipCode?: string;
  country?: string;
  phone?: string;
};

export type InvoiceInput = {
  id?: string;
  orderId?: string;
  createdAt?: number | string | Date;
  paymentVerifiedAt?: number | string | Date;
  total?: number;
  subtotal?: number;
  discountAmount?: number;
  couponDiscountAmount?: number;
  shippingAmount?: number;
  taxAmount?: number;
  gstAmount?: number;
  convenienceFeeTotal?: number;
  couponCode?: string | null;
  razorpayPaymentId?: string | null;
  razorpayOrderId?: string | null;
  status?: string;
  items?: InvoiceLineItem[];
  shippingAddress?: InvoiceAddress | null;
};

function safeNumber(value: unknown, fallback = 0): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function formatMoney(value: unknown): string {
  const n = safeNumber(value, 0);
  return `Rs. ${n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value?: number | string | Date): string {
  const d =
    value instanceof Date
      ? value
      : typeof value === "number"
        ? new Date(value)
        : value
          ? new Date(value)
          : new Date();
  if (Number.isNaN(d.getTime())) return new Date().toLocaleDateString("en-IN");
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Human invoice number — never show full Razorpay order_* IDs as the invoice #. */
export function getInvoiceNumber(order: InvoiceInput): string {
  const raw = String(order.id || order.orderId || order.razorpayOrderId || "ORDER");
  const cleaned = raw.replace(/^order[_-]?/i, "").replace(/[^a-zA-Z0-9]/g, "");
  const tail = (cleaned.slice(-8) || "00000000").toUpperCase();
  return `INV-${tail}`;
}

function getOrderRef(order: InvoiceInput): string {
  const raw = String(order.id || order.orderId || order.razorpayOrderId || "");
  if (!raw) return "N/A";
  // Short, readable ref — last 10 chars of razorpay id without "order_"
  const cleaned = raw.replace(/^order[_-]?/i, "");
  return cleaned.slice(-10).toUpperCase() || raw.slice(-10).toUpperCase();
}

function lineItemName(item: InvoiceLineItem): string {
  const name =
    item.productName?.trim() ||
    item.product?.name?.trim() ||
    "Product";
  return name;
}

function lineUnitPrice(item: InvoiceLineItem): number {
  if (item.priceAtPurchase != null) return safeNumber(item.priceAtPurchase);
  if (item.product?.salePrice != null) return safeNumber(item.product.salePrice);
  if (item.product?.price != null) return safeNumber(item.product.price);
  if (item.totalPrice != null && item.quantity) {
    return safeNumber(item.totalPrice) / Math.max(1, safeNumber(item.quantity, 1));
  }
  return 0;
}

function lineQty(item: InvoiceLineItem): number {
  return Math.max(1, Math.round(safeNumber(item.quantity, 1)));
}

function lineTotal(item: InvoiceLineItem): number {
  if (item.totalPrice != null) return safeNumber(item.totalPrice);
  return lineUnitPrice(item) * lineQty(item);
}

function customerName(addr?: InvoiceAddress | null): string {
  const first = addr?.firstName?.trim() || "";
  const last = addr?.lastName?.trim() || "";
  const full = `${first} ${last}`.trim();
  return full || "Customer";
}

function addressLines(addr?: InvoiceAddress | null): string[] {
  if (!addr) return ["Address not provided"];
  const lines: string[] = [];
  if (addr.address?.trim()) lines.push(addr.address.trim());
  const cityLine = [addr.city, addr.zipCode].filter(Boolean).join(", ");
  if (cityLine) lines.push(cityLine);
  if (addr.country?.trim()) lines.push(addr.country.trim());
  if (addr.phone?.trim()) lines.push(`Phone: ${addr.phone.trim()}`);
  if (addr.email?.trim()) lines.push(`Email: ${addr.email.trim()}`);
  return lines.length ? lines : ["Address not provided"];
}

function computeTotals(order: InvoiceInput) {
  const items = order.items || [];
  const itemsSubtotal = items.reduce((sum, item) => sum + lineTotal(item), 0);

  const subtotal = safeNumber(
    order.subtotal,
    itemsSubtotal
  );
  const discount = safeNumber(
    order.discountAmount ?? order.couponDiscountAmount,
    0
  );
  const shipping = safeNumber(order.shippingAmount, 0);
  const tax = safeNumber(order.taxAmount ?? order.gstAmount, 0);
  const convenience = safeNumber(order.convenienceFeeTotal, 0);
  const total = safeNumber(
    order.total,
    Math.max(0, subtotal - discount + shipping + tax + convenience)
  );

  return { subtotal, discount, shipping, tax, convenience, total };
}

/**
 * Builds a professional tax-style invoice PDF.
 * Returns the jsPDF instance (caller can save / output base64).
 */
export function buildInvoicePdf(order: InvoiceInput): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;

  const invoiceNo = getInvoiceNumber(order);
  const orderRef = getOrderRef(order);
  const dateStr = formatDate(order.paymentVerifiedAt || order.createdAt);
  const totals = computeTotals(order);
  const addr = order.shippingAddress;
  const items = order.items || [];

  // ── Header bar ─────────────────────────────────────────────
  doc.setFillColor(20, 20, 20);
  doc.rect(0, 0, pageWidth, 36, "F");

  doc.setTextColor(201, 168, 76);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("PMU SUPPLY", margin, 16);

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Elite Professional PMU Equipment", margin, 23);
  doc.text("pmusuppliesindia@gmail.com", margin, 29);

  doc.setTextColor(201, 168, 76);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("TAX INVOICE", pageWidth - margin, 16, { align: "right" });

  doc.setTextColor(220, 220, 220);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Invoice No: ${invoiceNo}`, pageWidth - margin, 23, { align: "right" });
  doc.text(`Date: ${dateStr}`, pageWidth - margin, 29, { align: "right" });

  // ── Meta row ───────────────────────────────────────────────
  let y = 46;
  doc.setTextColor(120, 120, 120);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("ORDER REF", margin, y);
  doc.text("PAYMENT", margin + 55, y);
  doc.text("STATUS", margin + 120, y);

  doc.setTextColor(30, 30, 30);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(orderRef, margin, y + 6);
  doc.text("Online (Razorpay)", margin + 55, y + 6);

  const statusLabel =
    order.status === "pending"
      ? "Pending"
      : order.status === "cancelled"
        ? "Cancelled"
        : order.status === "refunded"
          ? "Refunded"
          : "Paid";
  doc.setFont("helvetica", "bold");
  if (statusLabel === "Paid") {
    doc.setTextColor(22, 163, 74);
  } else if (statusLabel === "Pending") {
    doc.setTextColor(120, 120, 120);
  } else {
    doc.setTextColor(185, 28, 28);
  }
  doc.text(statusLabel.toUpperCase(), margin + 120, y + 6);

  // ── Bill To ────────────────────────────────────────────────
  y = 68;
  doc.setDrawColor(230, 230, 230);
  doc.line(margin, y - 6, pageWidth - margin, y - 6);

  doc.setTextColor(150, 150, 150);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("BILL TO / SHIP TO", margin, y);

  doc.setTextColor(20, 20, 20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(customerName(addr), margin, y + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(70, 70, 70);
  const lines = addressLines(addr);
  lines.forEach((line, i) => {
    doc.text(line, margin, y + 13 + i * 5);
  });

  // ── Line items table ───────────────────────────────────────
  const tableStartY = Math.max(y + 13 + lines.length * 5 + 8, 100);

  const body = items.length
    ? items.map((item, index) => {
        const qty = lineQty(item);
        const unit = lineUnitPrice(item);
        const amount = lineTotal(item);
        const variant =
          item.variantName && String(item.variantName).trim()
            ? String(item.variantName).trim()
            : "—";
        return [
          String(index + 1),
          lineItemName(item),
          variant,
          String(qty),
          formatMoney(unit),
          formatMoney(amount),
        ];
      })
    : [["—", "No line items", "—", "—", "—", "—"]];

  autoTable(doc, {
    startY: tableStartY,
    head: [["#", "Item Description", "Variant", "Qty", "Unit Price", "Amount"]],
    body,
    theme: "striped",
    styles: {
      font: "helvetica",
      fontSize: 9,
      cellPadding: 3,
      textColor: [40, 40, 40],
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: [20, 20, 20],
      textColor: [201, 168, 76],
      fontStyle: "bold",
      fontSize: 8,
      halign: "left",
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: "auto" },
      2: { cellWidth: 28 },
      3: { cellWidth: 12, halign: "center" },
      4: { cellWidth: 30, halign: "right" },
      5: { cellWidth: 30, halign: "right", fontStyle: "bold" },
    },
    margin: { left: margin, right: margin },
  });

  const finalY =
    (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable
      ?.finalY ?? tableStartY + 30;

  // ── Totals ─────────────────────────────────────────────────
  let ty = finalY + 12;
  const labelX = 125;
  const valueX = pageWidth - margin;

  const drawTotalRow = (
    label: string,
    value: string,
    opts?: { bold?: boolean; color?: [number, number, number]; gold?: boolean }
  ) => {
    doc.setFont("helvetica", opts?.bold ? "bold" : "normal");
    doc.setFontSize(opts?.bold ? 11 : 9);
    if (opts?.gold) {
      doc.setTextColor(201, 168, 76);
    } else if (opts?.color) {
      doc.setTextColor(...opts.color);
    } else {
      doc.setTextColor(90, 90, 90);
    }
    doc.text(label, labelX, ty);
    doc.setTextColor(opts?.gold ? 201 : 30, opts?.gold ? 168 : 30, opts?.gold ? 76 : 30);
    if (opts?.color && !opts.gold) doc.setTextColor(...opts.color);
    doc.text(value, valueX, ty, { align: "right" });
    ty += 7;
  };

  drawTotalRow("Subtotal", formatMoney(totals.subtotal));

  if (totals.discount > 0) {
    const coupon =
      order.couponCode && String(order.couponCode).trim()
        ? `Discount (${String(order.couponCode).toUpperCase()})`
        : "Discount";
    drawTotalRow(coupon, `- ${formatMoney(totals.discount)}`, {
      color: [22, 163, 74],
    });
  }

  drawTotalRow("Shipping", totals.shipping === 0 ? "FREE" : formatMoney(totals.shipping));

  if (totals.tax > 0) {
    drawTotalRow("GST / Tax", formatMoney(totals.tax));
  }

  if (totals.convenience > 0) {
    drawTotalRow("Convenience Fee", formatMoney(totals.convenience));
  }

  ty += 2;
  doc.setFillColor(20, 20, 20);
  doc.roundedRect(labelX - 4, ty - 5, pageWidth - margin - labelX + 4, 12, 1, 1, "F");
  doc.setTextColor(201, 168, 76);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("GRAND TOTAL", labelX, ty + 3);
  doc.text(formatMoney(totals.total), valueX, ty + 3, { align: "right" });

  // ── Footer notes ───────────────────────────────────────────
  const footerY = 275;
  doc.setDrawColor(230, 230, 230);
  doc.line(margin, footerY - 8, pageWidth - margin, footerY - 8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(140, 140, 140);
  doc.text(
    "This is a computer-generated invoice for your records. Prices are in Indian Rupees (INR).",
    pageWidth / 2,
    footerY,
    { align: "center" }
  );
  doc.text(
    "For support: pmusuppliesindia@gmail.com  ·  Thank you for choosing PMU SUPPLY.",
    pageWidth / 2,
    footerY + 5,
    { align: "center" }
  );

  // Optional payment ref in tiny print (not the main headline)
  if (order.razorpayPaymentId) {
    doc.setFontSize(7);
    doc.setTextColor(170, 170, 170);
    doc.text(
      `Payment Ref: ${order.razorpayPaymentId}`,
      pageWidth / 2,
      footerY + 10,
      { align: "center" }
    );
  }

  return doc;
}

/** Base64 PDF for email attachments (Node / server). */
export function buildInvoicePdfBase64(order: InvoiceInput): string {
  const doc = buildInvoicePdf(order);
  const buffer = doc.output("arraybuffer");
  return Buffer.from(buffer).toString("base64");
}

/** Suggested download filename. */
export function getInvoiceFilename(order: InvoiceInput): string {
  return `Invoice-PMU-${getInvoiceNumber(order)}.pdf`;
}

/** Sample order for testing / previews. */
export function getDummyInvoiceOrder(): InvoiceInput {
  return {
    id: "order_dummytest01abc",
    razorpayOrderId: "order_dummytest01abc",
    razorpayPaymentId: "pay_dummyPaymentRef123",
    status: "paid",
    createdAt: Date.now(),
    paymentVerifiedAt: Date.now(),
    subtotal: 8450,
    discountAmount: 845,
    couponDiscountAmount: 845,
    couponCode: "WELCOME10",
    shippingAmount: 0,
    taxAmount: 456.3,
    gstAmount: 456.3,
    convenienceFeeTotal: 50,
    total: 8111.3,
    shippingAddress: {
      firstName: "Priya",
      lastName: "Sharma",
      email: "priya.sharma@example.com",
      address: "12, Rosewood Studio, Linking Road",
      city: "Mumbai",
      zipCode: "400050",
      country: "India",
      phone: "+91 98765 43210",
    },
    items: [
      {
        productName: "Premium Microblading Kit Pro",
        variantName: "Rose Gold / Standard",
        quantity: 1,
        priceAtPurchase: 4999,
        totalPrice: 4999,
      },
      {
        productName: "Organic Brow Pigment — Soft Brown",
        variantName: "15 ml",
        quantity: 2,
        priceAtPurchase: 1299,
        totalPrice: 2598,
      },
      {
        productName: "Numbing Cream Medical Grade",
        variantName: null,
        quantity: 1,
        priceAtPurchase: 853,
        totalPrice: 853,
      },
    ],
  };
}
