import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

// GST invoice / payment receipt (PRD feature 12), emailed with the payment confirmation.
//
// The seller details are an open question for the client (PRD section 11, question 2), so they
// come from the server env. With INVOICE_GSTIN set the PDF is a tax invoice with CGST+SGST
// (same state) or IGST (other state); without it, a payment receipt.
//   INVOICE_LEGAL_NAME, INVOICE_GSTIN, INVOICE_ADDRESS, INVOICE_STATE, INVOICE_SAC (default 999692),
//   INVOICE_GST_PERCENT (default 18)

const NAVY = rgb(0.04, 0.07, 0.25);
const GREY = rgb(0.35, 0.38, 0.45);
const LINE = rgb(0.82, 0.85, 0.9);

export function seller() {
  return {
    name: process.env.INVOICE_LEGAL_NAME || 'South State Pro League (SSPL T10)',
    gstin: process.env.INVOICE_GSTIN || '',
    address: process.env.INVOICE_ADDRESS || 'ssplt10.co.in',
    state: process.env.INVOICE_STATE || 'Tamil Nadu',
    sac: process.env.INVOICE_SAC || '999692',
    gstPercent: Number(process.env.INVOICE_GST_PERCENT || 18),
  };
}

const money = (n) => `Rs. ${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** Indian financial year label for a date, e.g. 2026-27. */
export function financialYear(date) {
  const y = date.getFullYear();
  const start = date.getMonth() >= 3 ? y : y - 1;
  return `${start}-${String((start + 1) % 100).padStart(2, '0')}`;
}

/** Invoice number tied to the payment, so the same payment always has the same number. */
export const invoiceNumber = (paymentId, date) => `SSPL/${financialYear(date)}/${String(paymentId || '').replace(/^pay_/, '').toUpperCase()}`;

/**
 * Split a GST-inclusive total into taxable value and tax.
 * @returns {{taxable:number, cgst:number, sgst:number, igst:number, total:number}}
 */
export function splitGst(total, { gstPercent, sameState }) {
  const taxable = Math.round((total * 100) / (100 + gstPercent) * 100) / 100;
  const tax = Math.round((total - taxable) * 100) / 100;
  if (sameState) {
    const half = Math.round((tax / 2) * 100) / 100;
    return { taxable, cgst: half, sgst: Math.round((tax - half) * 100) / 100, igst: 0, total };
  }
  return { taxable, cgst: 0, sgst: 0, igst: tax, total };
}

/**
 * @param {{paymentId:string, paidAt?:Date|string, amount:number, buyer:{name:string, email?:string, phone?:string, state?:string, city?:string},
 *          description?:string, quantity?:number}} input amount is the GST-inclusive total paid
 * @returns {Promise<{pdf:Buffer, number:string, isTaxInvoice:boolean}>}
 */
export async function generateInvoicePdf({ paymentId, paidAt = new Date(), amount, buyer, description = 'SSPL T10 player registration and trials fee', quantity = 1 }) {
  const s = seller();
  const date = new Date(paidAt);
  const number = invoiceNumber(paymentId, date);
  const isTaxInvoice = Boolean(s.gstin);
  const sameState = !buyer.state || String(buyer.state).trim().toLowerCase() === s.state.trim().toLowerCase();
  const gst = splitGst(Number(amount) || 0, { gstPercent: s.gstPercent, sameState });

  const pdf = await PDFDocument.create();
  pdf.setTitle(`${isTaxInvoice ? 'Tax invoice' : 'Receipt'} ${number}`);
  const page = pdf.addPage([595.28, 841.89]); // A4 portrait
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const text = (t, x, y, opts = {}) => page.drawText(String(t ?? ''), { x, y, size: opts.size || 10, font: opts.bold ? bold : font, color: opts.color || NAVY });
  const right = (t, xRight, y, opts = {}) => {
    const f = opts.bold ? bold : font;
    const size = opts.size || 10;
    text(t, xRight - f.widthOfTextAtSize(String(t), size), y, opts);
  };
  const line = (y) => page.drawLine({ start: { x: 48, y }, end: { x: 547, y }, thickness: 0.8, color: LINE });

  text(isTaxInvoice ? 'TAX INVOICE' : 'PAYMENT RECEIPT', 48, 780, { bold: true, size: 20 });
  right(number, 547, 784, { bold: true, size: 11 });
  right(`Date: ${date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, 547, 768, { color: GREY });

  text('From', 48, 730, { bold: true, color: GREY, size: 9 });
  text(s.name, 48, 716, { bold: true });
  text(s.address, 48, 702, { color: GREY, size: 9 });
  text(`State: ${s.state}`, 48, 689, { color: GREY, size: 9 });
  if (s.gstin) text(`GSTIN: ${s.gstin}`, 48, 676, { size: 9 });

  text('Billed to', 320, 730, { bold: true, color: GREY, size: 9 });
  text(buyer.name || 'Player', 320, 716, { bold: true });
  if (buyer.email) text(buyer.email, 320, 702, { color: GREY, size: 9 });
  if (buyer.phone) text(buyer.phone, 320, 689, { color: GREY, size: 9 });
  if (buyer.city || buyer.state) text([buyer.city, buyer.state].filter(Boolean).join(', '), 320, 676, { color: GREY, size: 9 });

  line(650);
  text('Description', 48, 634, { bold: true, size: 9, color: GREY });
  text('SAC', 330, 634, { bold: true, size: 9, color: GREY });
  right('Qty', 410, 634, { bold: true, size: 9, color: GREY });
  right('Amount', 547, 634, { bold: true, size: 9, color: GREY });
  line(624);
  text(description, 48, 606);
  text(s.sac, 330, 606);
  right(String(quantity), 410, 606);
  right(money(isTaxInvoice ? gst.taxable : gst.total), 547, 606);
  line(590);

  let y = 568;
  const totalRow = (label, value, opts = {}) => { right(label, 440, y, { color: GREY, ...opts }); right(value, 547, y, opts); y -= 18; };
  if (isTaxInvoice) {
    totalRow('Taxable value', money(gst.taxable));
    if (sameState) {
      totalRow(`CGST @ ${s.gstPercent / 2}%`, money(gst.cgst));
      totalRow(`SGST @ ${s.gstPercent / 2}%`, money(gst.sgst));
    } else {
      totalRow(`IGST @ ${s.gstPercent}%`, money(gst.igst));
    }
  } else {
    totalRow(`Includes GST @ ${s.gstPercent}%`, money(Math.round((gst.total - gst.taxable) * 100) / 100));
  }
  y -= 4;
  totalRow('Total paid', money(gst.total), { bold: true, size: 12, color: NAVY });

  text(`Payment reference: ${paymentId}`, 48, 470, { size: 9, color: GREY });
  text('Paid online through Razorpay.', 48, 456, { size: 9, color: GREY });
  if (!isTaxInvoice) text('This is a payment receipt. A GST tax invoice will be issued once the league\'s GST details are set.', 48, 442, { size: 8, color: GREY });
  text('This is a computer-generated document and does not need a signature.', 48, 60, { size: 8, color: GREY });

  return { pdf: Buffer.from(await pdf.save()), number, isTaxInvoice };
}
