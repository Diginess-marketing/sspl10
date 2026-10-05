import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const ASSET_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../assets/certificates');
const TEMPLATES = {
  achievement: 'certificate-achievement-template.png',
  participation: 'certificate-participation-template.png',
};

// A4 landscape; the template artwork has the same aspect ratio.
const PAGE_WIDTH = 841.89;
const PAGE_HEIGHT = 595.28;

const NAVY = rgb(0.06, 0.13, 0.4);
const GOLD = rgb(0.55, 0.42, 0.13);
const GREY = rgb(0.35, 0.35, 0.35);

const imageCache = new Map();

async function loadTemplate(kind) {
  if (!imageCache.has(kind)) {
    imageCache.set(kind, await fs.readFile(path.join(ASSET_DIR, TEMPLATES[kind])));
  }
  return imageCache.get(kind);
}

/** Largest font size (<= max) at which `text` fits in `maxWidth`. */
function fitFontSize(font, text, max, maxWidth) {
  let size = max;
  while (size > 10 && font.widthOfTextAtSize(text, size) > maxWidth) size -= 1;
  return size;
}

function drawCentered(page, text, { font, size, y, color }) {
  const width = font.widthOfTextAtSize(text, size);
  page.drawText(text, { x: (PAGE_WIDTH - width) / 2, y, size, font, color });
}

/**
 * Build a trial certificate PDF.
 * @param {{kind:'achievement'|'participation', playerName:string, level:number,
 *          certificateNo:string, issuedAt?:Date}} options
 * @returns {Promise<Buffer>}
 */
export async function generateCertificatePdf({ kind, playerName, level, certificateNo, issuedAt = new Date() }) {
  if (!TEMPLATES[kind]) throw new Error(`Unknown certificate kind: ${kind}`);

  const pdf = await PDFDocument.create();
  pdf.setTitle(`SSPL Trials Level ${level} – Certificate of ${kind === 'achievement' ? 'Achievement' : 'Participation'}`);
  pdf.setAuthor('Southern Street Premier League');
  pdf.setSubject(`Certificate ${certificateNo}`);

  const page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const image = await pdf.embedPng(await loadTemplate(kind));
  page.drawImage(image, { x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT });

  const nameFont = await pdf.embedFont(StandardFonts.TimesRomanBold);
  const bodyFont = await pdf.embedFont(StandardFonts.HelveticaBold);
  const smallFont = await pdf.embedFont(StandardFonts.Helvetica);

  // Name sits just above the signature-style line (~46% from the top of the artwork).
  const name = playerName.trim().toUpperCase();
  const nameSize = fitFontSize(nameFont, name, 30, PAGE_WIDTH * 0.5);
  drawCentered(page, name, { font: nameFont, size: nameSize, y: PAGE_HEIGHT * 0.555, color: NAVY });

  // Level, between the line and the body text
  const levelText = `LEVEL ${level}  ·  SSPL TRIALS`;
  drawCentered(page, levelText, { font: bodyFont, size: 12, y: PAGE_HEIGHT * 0.503, color: GOLD });

  // Certificate number and date, small, along the bottom edge
  const footer = `Certificate No. ${certificateNo}   ·   Issued ${issuedAt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`;
  drawCentered(page, footer, { font: smallFont, size: 8, y: PAGE_HEIGHT * 0.047, color: GREY });

  return Buffer.from(await pdf.save());
}

/** Human-readable, unique enough: SSPL-L2-A-7K3F9Q (level, kind initial, random). */
export function newCertificateNo(level, kind) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 6; i += 1) suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `SSPL-L${level}-${kind === 'achievement' ? 'A' : 'P'}-${suffix}`;
}
