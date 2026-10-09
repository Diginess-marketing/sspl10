import { API_BASE_URL } from '@/config/api';

// Counts a QR scan on the server (PRD 7.3). Both the /qr/:code page and a QR link that
// opens /register directly call this; each code or campaign is counted once per browser
// session, so the /qr page's redirect to /register is not counted twice.

const SESSION_KEY = 'sspl_qr_scans_counted';

function alreadyCounted(key: string): boolean {
  try {
    const seen: string[] = JSON.parse(sessionStorage.getItem(SESSION_KEY) || '[]');
    if (seen.includes(key)) return true;
    sessionStorage.setItem(SESSION_KEY, JSON.stringify([...seen, key]));
  } catch {
    // Storage blocked: count anyway
  }
  return false;
}

export async function recordQrScan(input: { code?: string; utmSource?: string | null; utmCampaign?: string | null; via: 'qr_page' | 'link' }): Promise<string | null> {
  const key = input.code ? `code:${input.code}` : `campaign:${input.utmSource || ''}:${input.utmCampaign || ''}`;
  if (!input.code && !input.utmCampaign) return null;
  if (alreadyCounted(key) || (input.via === 'link' && alreadyCounted('any-qr-page'))) return null;
  if (input.via === 'qr_page') alreadyCounted('any-qr-page');
  try {
    const response = await fetch(`${API_BASE_URL}/qr/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: input.code, utm_source: input.utmSource, utm_campaign: input.utmCampaign, referrer: document.referrer, via: input.via }),
      keepalive: true,
    });
    if (!response.ok) return null;
    const { code } = await response.json();
    return code || null;
  } catch {
    return null; // counting must never block the page
  }
}
