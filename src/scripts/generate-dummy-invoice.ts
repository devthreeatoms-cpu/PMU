/**
 * Generate a dummy invoice PDF for manual QA.
 *
 * Run:
 *   npx tsx src/scripts/generate-dummy-invoice.ts
 *
 * Output:
 *   ./tmp/Invoice-PMU-INV-DUMMY.pdf  (path printed on success)
 */

import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import {
  buildInvoicePdf,
  getDummyInvoiceOrder,
  getInvoiceFilename,
  getInvoiceNumber,
} from "../lib/invoice";

function main() {
  const order = getDummyInvoiceOrder();
  const doc = buildInvoicePdf(order);
  const filename = getInvoiceFilename(order);
  const outDir = join(process.cwd(), "tmp");
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, filename);

  const buffer = Buffer.from(doc.output("arraybuffer"));
  writeFileSync(outPath, buffer);

  console.log("✓ Dummy invoice generated");
  console.log(`  Invoice #: ${getInvoiceNumber(order)}`);
  console.log(`  Customer:  ${order.shippingAddress?.firstName} ${order.shippingAddress?.lastName}`);
  console.log(`  Items:     ${order.items?.length}`);
  console.log(`  Total:     Rs. ${order.total}`);
  console.log(`  File:      ${outPath}`);
  console.log(`  Bytes:     ${buffer.length}`);
}

main();
