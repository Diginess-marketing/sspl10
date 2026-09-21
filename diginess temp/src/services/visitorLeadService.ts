
import { supabase } from "@/integrations/supabase/client";
import { getUTMData } from "@/utils/utm";

interface VisitorLeadData {
    full_name?: string;
    email?: string;
    phone?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    page_url?: string;
}

/**
 * Extract QR code ID from URL parameters
 */
function getQRCodeFromURL(): string | null {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('qr') || urlParams.get('qr_code') || null;
    } catch {
        return null;
    }
}

class VisitorLeadService {
    private lastSyncedHash: string | null = null;
    private debounceTimer: NodeJS.Timeout | null = null;
    private readonly DEBOUNCE_MS = 2000; // Wait 2s after typing stops before syncing

    /**
     * Generates a simple hash of the lead data to detect changes
     */
    private generateHash(data: VisitorLeadData): string {
        return `${data.full_name || ''}|${data.email || ''}|${data.phone || ''}`;
    }

    /**
     * Syncs visitor data to Supabase if it has changed and contains minimal contact info.
     * Debounced to prevent excessive API calls while typing.
     */
    public syncVisitorLead(data: VisitorLeadData) {
        // 1. Basic Validation: Track even if anonymous, but only if they have SOME utm data or QR
        // We removed the strict requirement for email/phone to capture anonymous campaign traffic
        // 2. Clear existing timer
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        // 3. Set new timer
        this.debounceTimer = setTimeout(async () => {
            const currentHash = this.generateHash(data);

            // 4. Check if data changed significantly since last sync
            // We check localStorage too, in case they refreshed the page
            const storedHash = localStorage.getItem('last_synced_lead_hash');

            if (currentHash === this.lastSyncedHash || currentHash === storedHash) {
                return; // No changes
            }

            // 5. Prepare Payload
            const utmData = getUTMData();
            const qrCodeId = getQRCodeFromURL();

            // Parse basic device info for anonymous name
            const ua = window.navigator?.userAgent || '';
            let deviceType = 'Desktop';
            if (/mobile/i.test(ua)) deviceType = 'Mobile';
            if (/tablet/i.test(ua)) deviceType = 'Tablet';
            
            let os = 'Unknown OS';
            if (/windows/i.test(ua)) os = 'Windows';
            else if (/mac/i.test(ua)) os = 'macOS';
            else if (/linux/i.test(ua)) os = 'Linux';
            else if (/android/i.test(ua)) os = 'Android';
            else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';

            const isAnonymous = !data.email && !data.phone && !data.full_name;
            const defaultName = isAnonymous ? `Anonymous (${deviceType} / ${os})` : data.full_name;

            const payload = {
                name: defaultName || null,
                email: data.email || null,
                phone: data.phone || null,
                utm_source: utmData?.utm_source || data.utm_source || (qrCodeId ? 'qr' : null),
                utm_medium: utmData?.utm_medium || data.utm_medium || (qrCodeId ? 'qr' : null),
                utm_campaign: utmData?.utm_campaign || data.utm_campaign,
                page_url: window.location.href,
                qr_code_id: qrCodeId,
                // created_at is automatic
            };

            try {
                console.log('Syncing visitor lead...', payload);
                const { error } = await supabase.from('visitor_leads').insert(payload);

                if (!error) {
                    this.lastSyncedHash = currentHash;
                    localStorage.setItem('last_synced_lead_hash', currentHash);
                } else {
                    console.warn('Failed to sync visitor lead:', error);
                }
            } catch (err) {
                console.warn('Error in visitor lead sync:', err);
            }
        }, this.DEBOUNCE_MS);
    }
}

export const visitorLeadService = new VisitorLeadService();

