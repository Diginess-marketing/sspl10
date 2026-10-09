import qrGenerator from 'qrcode-generator';

// Print-ready QR images for the campaign manager (PRD 7.1): SVG, PNG and a printable card.

function matrix(text: string) {
  const qr = qrGenerator(0, 'M'); // medium error correction survives print wear
  qr.addData(text);
  qr.make();
  return qr;
}

/** Square SVG with a quiet zone of 4 modules. */
export function qrSvg(text: string, size = 512): string {
  const qr = matrix(text);
  const n = qr.getModuleCount();
  const margin = 4;
  const total = n + margin * 2;
  let path = '';
  for (let r = 0; r < n; r += 1) {
    for (let c = 0; c < n; c += 1) {
      if (qr.isDark(r, c)) path += `M${c + margin} ${r + margin}h1v1h-1z`;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" width="${size}" height="${size}" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#fff"/><path d="${path}" fill="#000"/></svg>`;
}

/** PNG blob, drawn module by module so it stays sharp at print size. */
export async function qrPng(text: string, size = 1024): Promise<Blob> {
  const qr = matrix(text);
  const n = qr.getModuleCount();
  const margin = 4;
  const scale = Math.max(1, Math.floor(size / (n + margin * 2)));
  const px = (n + margin * 2) * scale;
  const canvas = document.createElement('canvas');
  canvas.width = px;
  canvas.height = px;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is not available');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, px, px);
  ctx.fillStyle = '#000';
  for (let r = 0; r < n; r += 1) {
    for (let c = 0; c < n; c += 1) {
      if (qr.isDark(r, c)) ctx.fillRect((c + margin) * scale, (r + margin) * scale, scale, scale);
    }
  }
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not create PNG'))), 'image/png'));
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const esc = (v: string) => v.replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch] as string));

/** Opens a printable A6 card: QR, the partner's name and region, and the company line. */
export function printQrCard({ url, name, region, companyLine }: { url: string; name: string; region?: string | null; companyLine: string }) {
  const win = window.open('', '_blank', 'width=520,height=760');
  if (!win) throw new Error('Allow pop-ups to print the card');
  win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${esc(name)} — SSPL QR card</title>
<style>
  @page { size: A6; margin: 8mm; }
  body { font-family: Arial, Helvetica, sans-serif; margin: 0; color: #0a1240; }
  .card { border: 2px solid #0a1240; border-radius: 12px; padding: 18px; text-align: center; max-width: 360px; margin: 16px auto; }
  h1 { font-size: 20px; margin: 4px 0 2px; } .region { font-size: 14px; margin: 0 0 12px; color: #334; }
  .qr svg { width: 260px; height: 260px; } .cta { font-weight: bold; font-size: 16px; margin: 10px 0 4px; }
  .url { font-size: 11px; word-break: break-all; color: #334; } .company { font-size: 11px; margin-top: 12px; border-top: 1px solid #ccd; padding-top: 8px; }
</style></head><body><div class="card">
  <div style="font-weight:bold;letter-spacing:2px;font-size:12px">SSPL T10</div>
  <h1>${esc(name)}</h1>${region ? `<p class="region">${esc(region)}</p>` : ''}
  <div class="qr">${qrSvg(url, 260)}</div>
  <p class="cta">Scan to register for SSPL trials</p>
  <p class="url">${esc(url)}</p>
  <p class="company">${esc(companyLine)}</p>
</div><script>window.onload = () => { window.print(); };</script></body></html>`);
  win.document.close();
}
