// Branded A4 PDF receipt for a completed player registration.
// The page is built with DOM calls (textContent, never innerHTML) so player-entered text
// can't inject markup, rendered off-screen, and turned into a PDF by html2pdf.

export interface ReceiptData {
  registrationId: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  position: string;
  city: string;
  state: string;
  pincode?: string;
  preferredTrials?: string;
  schoolName?: string;
  amount: number;
  paymentId?: string;
  orderId?: string;
  /** The player's photo: the file itself (preferred) or a same-origin URL. */
  photo?: Blob | string | null;
}

// Photo box in the PDF, and its 3x render size for a sharp print.
const PHOTO_W = 120;
const PHOTO_H = 144;

/**
 * Crops the photo to the photo box (top-anchored "cover") and returns it as a JPEG data URL.
 * html2canvas ignores object-fit and can miss blob: URLs, so the PDF gets finished pixels.
 * Returns null if the photo can't be read; the receipt then shows the initial instead.
 */
async function photoForReceipt(photo: ReceiptData['photo']): Promise<string | null> {
  if (!photo) return null;
  try {
    const source = typeof photo === 'string' ? await (await fetch(photo)).blob() : photo;
    const bitmap = await createImageBitmap(source);
    const canvas = document.createElement('canvas');
    canvas.width = PHOTO_W * 3;
    canvas.height = PHOTO_H * 3;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    const scale = Math.max(canvas.width / bitmap.width, canvas.height / bitmap.height);
    const w = bitmap.width * scale;
    const h = bitmap.height * scale;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, (canvas.width - w) / 2, 0, w, h); // centred horizontally, top kept (faces)
    bitmap.close();
    return canvas.toDataURL('image/jpeg', 0.9);
  } catch (error) {
    console.warn('Receipt photo could not be read', error);
    return null;
  }
}

const LOGO = '/assets/img/sspl-logo-color.png';

const C = {
  navy: '#0a1240',
  navyDeep: '#021447',
  blue: '#1f57d6',
  lime: '#dffc35',
  sky: '#eef5ff',
  muted: 'rgba(10, 18, 64, 0.68)',
  line: 'rgba(10, 18, 64, 0.10)',
  green: '#15803d',
};
const DISPLAY = "'IBM Plex Sans Condensed', 'Roboto Condensed', Arial, sans-serif";
const BODY = "'Inter', Arial, sans-serif";

type Style = Partial<CSSStyleDeclaration>;

function el(tag: string, style: Style = {}, children: (Node | string)[] = []): HTMLElement {
  const node = document.createElement(tag);
  Object.assign(node.style, style);
  for (const child of children) {
    node.append(typeof child === 'string' ? document.createTextNode(child) : child);
  }
  return node;
}

function img(src: string, style: Style): HTMLImageElement {
  const image = document.createElement('img');
  image.src = src;
  image.alt = '';
  Object.assign(image.style, style);
  return image;
}

const label = (text: string) =>
  el('div', { fontFamily: DISPLAY, fontSize: '10px', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', color: C.muted, marginBottom: '3px' }, [text]);

const field = (name: string, value: string | undefined, mono = false) =>
  el('div', { padding: '10px 0', borderBottom: `1px solid ${C.line}` }, [
    label(name),
    el('div', { fontFamily: mono ? 'Consolas, monospace' : BODY, fontSize: mono ? '12px' : '14px', fontWeight: '600', color: C.navy, wordBreak: 'break-all' }, [value?.trim() || '—']),
  ]);

const formatDate = (value?: string) => {
  const date = value ? new Date(value) : new Date();
  return Number.isNaN(date.getTime()) ? value ?? '' : date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

function buildReceipt(data: ReceiptData, photoSrc: string | null): HTMLElement {
  // Watermark: large faded logo and wordmark, rotated, behind everything.
  const watermark = el('div', { position: 'absolute', inset: '0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transform: 'rotate(-28deg)', opacity: '0.07', pointerEvents: 'none' }, [
    img(LOGO, { width: '380px', height: 'auto' }),
    el('div', { fontFamily: DISPLAY, fontSize: '88px', fontWeight: '700', fontStyle: 'italic', color: C.navy, letterSpacing: '0.04em', marginTop: '10px' }, ['SSPL T10']),
  ]);

  const header = el('div', { background: `linear-gradient(120deg, ${C.navyDeep}, ${C.blue})`, color: '#fff', padding: '28px 40px', display: 'flex', alignItems: 'center', gap: '20px' }, [
    el('div', { background: '#fff', borderRadius: '14px', padding: '8px', display: 'flex' }, [img(LOGO, { width: '56px', height: 'auto' })]),
    el('div', { flex: '1' }, [
      el('div', { fontFamily: DISPLAY, fontSize: '11px', fontWeight: '700', letterSpacing: '0.16em', textTransform: 'uppercase', color: C.lime }, ['Southern Street Premier League']),
      el('div', { fontFamily: DISPLAY, fontSize: '30px', fontWeight: '700', fontStyle: 'italic', textTransform: 'uppercase', lineHeight: '1.05', marginTop: '4px' }, ['Registration Receipt']),
    ]),
    el('div', { textAlign: 'right', fontFamily: BODY, fontSize: '11px', color: 'rgba(255,255,255,0.8)' }, [
      el('div', {}, ['Issued on']),
      el('div', { fontSize: '14px', fontWeight: '700', color: '#fff', marginTop: '2px' }, [formatDate()]),
    ]),
  ]);

  const photo = photoSrc
    ? img(photoSrc, { width: `${PHOTO_W}px`, height: `${PHOTO_H}px`, borderRadius: '12px', border: `3px solid ${C.sky}` })
    : el('div', { width: `${PHOTO_W}px`, height: `${PHOTO_H}px`, borderRadius: '12px', background: C.sky, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: DISPLAY, fontSize: '44px', fontWeight: '700', color: C.blue }, [
      (data.fullName.trim()[0] || '?').toUpperCase(),
    ]);

  const identity = el('div', { display: 'flex', gap: '24px', alignItems: 'center', padding: '28px 40px 8px' }, [
    photo,
    el('div', { flex: '1' }, [
      el('div', { fontFamily: DISPLAY, fontSize: '11px', fontWeight: '700', letterSpacing: '0.14em', textTransform: 'uppercase', color: C.blue }, ['Player']),
      el('div', { fontFamily: DISPLAY, fontSize: '32px', fontWeight: '700', fontStyle: 'italic', textTransform: 'uppercase', color: C.navy, lineHeight: '1.05', margin: '4px 0 10px' }, [data.fullName]),
      el('div', { display: 'inline-block', background: C.sky, color: C.blue, fontFamily: DISPLAY, fontSize: '12px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 12px 9px', lineHeight: '1', borderRadius: '999px' }, [data.position || 'Player']),
      el('div', { fontFamily: 'Consolas, monospace', fontSize: '11px', color: C.muted, marginTop: '10px' }, [`Player ID: ${data.registrationId}`]),
    ]),
  ]);

  const sectionTitle = (text: string) =>
    el('div', { gridColumn: '1 / -1', fontFamily: DISPLAY, fontSize: '14px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: C.navy, margin: '6px 0 2px' }, [text]);

  const details = el('div', { display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '32px', padding: '8px 40px' }, [
    sectionTitle('Player details'),
    field('Registration ID', data.registrationId, true),
    field('Player name', data.fullName),
    field('Email', data.email),
    field('Phone', data.phone),
    field('Date of birth', data.dateOfBirth ? formatDate(data.dateOfBirth) : undefined),
    field('Player type', data.position),
    field('State', data.state),
    field('City', data.city),
    field('PIN code', data.pincode),
    field('School / College', data.schoolName),
    ...(data.preferredTrials ? [field('Preferred trials', data.preferredTrials)] : []),
  ]);

  const payment = el('div', { margin: '20px 40px 0', background: 'rgba(238, 245, 255, 0.82)', borderRadius: '14px', padding: '20px 24px' }, [
    el('div', { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }, [
      el('div', { fontFamily: DISPLAY, fontSize: '14px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: C.navy }, ['Payment']),
      el('div', { fontFamily: DISPLAY, fontSize: '11px', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#fff', background: C.green, padding: '3px 12px 8px', lineHeight: '1', borderRadius: '999px' }, ['Paid']),
    ]),
    el('div', { display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '32px' }, [
      field('Payment ID', data.paymentId, true),
      field('Order ID', data.orderId, true),
      field('Payment status', 'Completed'),
      field('Registration date', formatDate()),
    ]),
    el('div', { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '14px' }, [
      el('div', { fontFamily: BODY, fontSize: '13px', color: C.muted }, ['Amount paid (incl. GST)']),
      el('div', { fontFamily: DISPLAY, fontSize: '30px', fontWeight: '700', color: C.navy }, [`₹${Number(data.amount).toLocaleString('en-IN')}`]),
    ]),
  ]);

  const footer = el('div', { position: 'absolute', left: '0', right: '0', bottom: '0', padding: '18px 40px', borderTop: `4px solid ${C.lime}`, background: C.navyDeep, color: 'rgba(255,255,255,0.8)', fontFamily: BODY, fontSize: '11px', display: 'flex', justifyContent: 'space-between' }, [
    el('span', {}, ['Thank you for registering with SSPL T10. Keep this receipt for your trials.']),
    el('span', { fontWeight: '700', color: '#fff' }, ['ssplt10.co.in']),
  ]);

  // 794 × 1123 px is A4 at 96 dpi.
  return el('div', { position: 'relative', width: '794px', height: '1123px', overflow: 'hidden', background: '#fff', boxSizing: 'border-box' }, [
    watermark,
    el('div', { position: 'relative' }, [header, identity, details, payment]),
    footer,
  ]);
}

const imagesLoaded = (root: HTMLElement) =>
  Promise.all(
    Array.from(root.querySelectorAll('img')).map((image) =>
      image.complete ? Promise.resolve() : new Promise<void>((resolve) => { image.onload = image.onerror = () => resolve(); }),
    ),
  );

export async function downloadRegistrationReceipt(data: ReceiptData): Promise<void> {
  const { default: html2pdf } = await import('html2pdf.js');
  const page = buildReceipt(data, await photoForReceipt(data.photo));
  // Rendered off-screen: html2canvas needs the node in the document to lay it out.
  const holder = el('div', { position: 'fixed', left: '-10000px', top: '0' }, [page]);
  document.body.append(holder);
  try {
    await imagesLoaded(page);
    await document.fonts?.ready;
    const safeName = data.fullName.replace(/[^\p{L}\p{N}]+/gu, '_').replace(/^_+|_+$/g, '') || 'Player';
    await html2pdf()
      .set({
        margin: 0,
        filename: `SSPL_Receipt_${safeName}.pdf`,
        image: { type: 'jpeg', quality: 0.96 },
        html2canvas: { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff' },
        jsPDF: { unit: 'px', format: [794, 1123], orientation: 'portrait', hotfixes: ['px_scaling'] },
      } as never)
      .from(page)
      .save();
  } finally {
    holder.remove();
  }
}
