// Payment overlay utility to show/hide overlay during payment
const paymentOverlay = {
  element: null as HTMLDivElement | null,
  open() {
    if (this.element) return;
    this.element = document.createElement('div');
    this.element.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9998;';
    document.body.appendChild(this.element);
  },
  close() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
      this.element = null;
    }
  }
};

// Resolve the base URL for API calls
function resolveBaseUrl(): string {
  // Production API URL - always use ssplt10.co.in
  const PRODUCTION_API = 'https://ssplt10.co.in/api';

  // Only use local backend during actual dev mode (npm run dev), not production builds/previews
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    const { hostname } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://127.0.0.1:3003/api';
    }
  }

  // For ALL production builds (including vite preview), use the production API
  return PRODUCTION_API;
}
const BASE_URL: string = resolveBaseUrl();
console.log('[RazorpayService] Resolved API Base URL:', BASE_URL);

export interface RazorpayPaymentSuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayPaymentFailedError {
  code?: string;
  description?: string;
  source?: string;
  step?: string;
  reason?: string;
  metadata?: {
    order_id?: string;
    payment_id?: string;
  };
  http_status?: number;
}

export interface RazorpayPaymentFailedEvent {
  error?: RazorpayPaymentFailedError;
}

export function isRazorpayFailedEvent(value: unknown): value is RazorpayPaymentFailedEvent {
  const v = value as any;
  return Boolean(v && typeof v === 'object' && 'error' in v && v.error && typeof v.error === 'object');
}

interface PaymentOptions {
  amount?: number; // Amount in Rupees (optional if amountPaise is provided)
  amountPaise?: number; // Amount in Paise (preferred)
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  onSuccess: (response: RazorpayPaymentSuccessResponse) => void;
  onFailure: (error: RazorpayPaymentFailedError) => void;
  onDismiss?: () => void;
}

let razorpayInstance: any = null;
let cachedPublicKeyId: string | null = null;

class RazorpayService {
  // Fetch configuration (key, amount, currency) from backend
  async getConfig() {
    try {
      const response = await fetch(`${BASE_URL}/config`, { method: 'GET' });
      const contentType = response.headers.get("content-type");
      if (!response.ok) {
        // silently fail or return null to trigger fallback
        return null;
      }
      if (contentType && contentType.indexOf("application/json") !== -1) {
        return await response.json();
      } else {
        // Received HTML or other non-JSON, likely 404/fallback
        return null;
      }
    } catch (error) {
      console.error('Failed to fetch config:', error);
      throw error;
    }
  }

  // Resolve Razorpay public key id
  private async getPublicKeyId(): Promise<string> {
    if (cachedPublicKeyId) return cachedPublicKeyId;

    try {
      const config = await this.getConfig();
      const fromBackend = (config && (config.razorpayKeyId || config.key || config.publicKey || config.razorpay_key_id)) || null;

      if (fromBackend) {
        cachedPublicKeyId = String(fromBackend);
        return cachedPublicKeyId;
      }
    } catch (e) {
      // Fallback
    }

    const envKey = import.meta.env.VITE_RAZORPAY_KEY_ID as string | undefined;
    if (!envKey) {
      throw new Error('Razorpay key not available. Set VITE_RAZORPAY_KEY_ID or fix /api/config.');
    }
    cachedPublicKeyId = envKey;
    return envKey;
  }

  // Create a new order via backend
  async createOrder(formData: Record<string, any> = {}) {
    try {
      const response = await fetch(`${BASE_URL}/razorpay/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Send flat body for backend compatibility
        body: JSON.stringify({
          ...formData,
          notes: {
            registration_id: formData.registrationId,
            ...formData.notes
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create order: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const responseData = await response.json();
      // Expected: { order: { id, amount, ... }, registrationId: string }
      return responseData;
    } catch (err) {
      throw err;
    }
  }

  // Initiate payment with Razorpay
  async initiatePayment(options: PaymentOptions) {
    if (!window.Razorpay) {
      throw new Error('Razorpay script not loaded');
    }

    const razorpayKey = await this.getPublicKeyId();
    if (!razorpayKey || razorpayKey.length < 5) {
      throw new Error(`Invalid Razorpay key: ${razorpayKey}`);
    }

    if (razorpayInstance) {
      razorpayInstance.close();
      razorpayInstance = null;
    }

    // Determine amount in paise
    // If amountPaise is present, use it.
    // If only amount (Rupees) is present, multiply by 100.
    const finalAmount = options.amountPaise ?? (options.amount ? Math.round(options.amount * 100) : 0);

    const razorpayOptions: any = {
      key: razorpayKey,
      amount: finalAmount,
      currency: 'INR',
      name: 'SSPL T10',
      order_id: options.orderId,
      prefill: {
        name: options.customerName,
        email: options.customerEmail,
        contact: options.customerPhone,
      },
      theme: { color: '#3399cc' },
      handler: (response: RazorpayPaymentSuccessResponse) => {
        try { paymentOverlay.close(); } catch { }
        try {
          options.onSuccess(response);
        } catch (error) {
          console.error('Error in onSuccess callback:', error);
          throw error;
        }
      },
      modal: {
        escape: false,
        animation: false,
        ondismiss: () => {
          try { paymentOverlay.close(); } catch { }
          if (options.onDismiss) {
            options.onDismiss();
          }
          options.onFailure({
            code: 'PAYMENT_CANCELLED',
            description: 'Payment closed by user',
            reason: 'payment_cancelled',
            source: 'customer',
            step: 'modal_dismiss',
            metadata: { order_id: options.orderId },
          });
        },
      },
    };

    try {
      razorpayInstance = new window.Razorpay(razorpayOptions);
      razorpayInstance.on('payment.failed', (payload: unknown) => {
        try { paymentOverlay.close(); } catch { }
        let failureError: RazorpayPaymentFailedError;
        if (isRazorpayFailedEvent(payload) && payload.error) {
          failureError = payload.error;
        } else {
          failureError = {
            description: typeof payload === 'string' ? payload : 'Payment failed',
            metadata: { order_id: razorpayOptions?.order_id },
          };
        }
        options.onFailure(failureError);
      });

      try { paymentOverlay.open(); } catch { }
      razorpayInstance.open();
    } catch (initError: any) {
      throw new Error(`Failed to initialize Razorpay: ${initError.message}`);
    }
  }

  async closeModal() {
    try {
      if (razorpayInstance) {
        razorpayInstance.close();
        razorpayInstance = null;
      }
    } catch (error) {
      razorpayInstance = null;
    }
  }

  async verifyPayment(paymentId: string, orderId: string, signature: string, registrationId: string) {
    try {
      const response = await fetch(`${BASE_URL}/razorpay/verify-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationId,
          paymentId,
          orderId,
          signature,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Payment verification failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      return await response.json();
    } catch (err) {
      throw err;
    }
  }

  async cancelPayment(paymentId: string) {
    try {
      if (!paymentId || typeof paymentId !== 'string' || !paymentId.startsWith('pay_')) {
        throw new Error('Invalid paymentId');
      }

      const resp = await fetch(`${BASE_URL}/razorpay/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId }),
      });

      const text = await resp.text();
      let json: any;
      try { json = text ? JSON.parse(text) : {}; } catch { json = { raw: text }; }

      if (!resp.ok) {
        const desc = json?.error || json?.razorpay?.description || text || 'Cancel failed';
        throw new Error(desc);
      }
      return json;
    } catch (err) {
      throw err;
    }
  }
}

export const razorpayService = new RazorpayService();
