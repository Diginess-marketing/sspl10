import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { razorpayService, type RazorpayPaymentSuccessResponse, type RazorpayPaymentFailedError } from '@/integrations/razorpayService';
import { getUTMData } from '@/utils/utm';

interface PlayerData {
  name: string;
  email: string;
  contact: string;
  age: number;
  team: string;
}

const SimplePlayerRegistrationForm: React.FC = () => {
  const navigate = useNavigate();
  const [playerData, setPlayerData] = useState<PlayerData>({
    name: '',
    email: '',
    contact: '',
    age: 0,
    team: '',
  });
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState<boolean>(Boolean(typeof window !== 'undefined' && (window as any).Razorpay));
  const [scriptLoadError, setScriptLoadError] = useState<string | null>(null);
  const [isLoadingScript, setIsLoadingScript] = useState(false);

  // Fetch config on mount
  const [config, setConfig] = useState<{ amount: number; amount_paise: number } | null>(null);

  React.useEffect(() => {
    razorpayService.getConfig().then(data => {
      if (data) setConfig(data);
    }).catch(console.error);
  }, []);

  const displayAmount = config?.amount ?? (Number(import.meta.env.VITE_REGISTRATION_FEE ?? 10) || 10);

  const ensureRazorpayLoaded = useCallback((): Promise<boolean> => {
    if (typeof window === 'undefined') {
      return Promise.resolve(false);
    }

    if ((window as any).Razorpay) {
      setRazorpayLoaded(true);
      setScriptLoadError(null);
      return Promise.resolve(true);
    }

    setIsLoadingScript(true);

    return new Promise<boolean>((resolve, reject) => {
      // Check for existing script to prevent duplicates
      const existingScript = document.querySelector<HTMLScriptElement>('#razorpay-js');
      const scriptElement = existingScript ?? document.createElement('script');

      const handleLoad = () => {
        setIsLoadingScript(false);
        setRazorpayLoaded(true);
        setScriptLoadError(null);
        cleanup();
        resolve(true);
      };

      const handleError = () => {
        const message = 'Failed to load payment system. Please check your internet connection and retry.';
        setIsLoadingScript(false);
        setRazorpayLoaded(false);
        setScriptLoadError(message);
        cleanup();
        reject(new Error(message));
      };

      const cleanup = () => {
        scriptElement.removeEventListener('load', handleLoad);
        scriptElement.removeEventListener('error', handleError);
      };

      scriptElement.addEventListener('load', handleLoad);
      scriptElement.addEventListener('error', handleError);

      if (!existingScript) {
        scriptElement.id = 'razorpay-js';
        scriptElement.src = 'https://checkout.razorpay.com/v1/checkout.js';
        scriptElement.async = true;
        document.body.appendChild(scriptElement);
      }
    });
  }, []);

  const retryScriptLoad = useCallback(() => {
    ensureRazorpayLoaded().catch(() => {
      /* error state already handled via ensureRazorpayLoaded */
    });
  }, [ensureRazorpayLoaded]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPlayerData((prev) => ({
      ...prev,
      [name]: name === 'age' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPaymentProcessing(true);

    try {
      const loaded = await ensureRazorpayLoaded();
      if (!loaded) {
        throw new Error('Payment system is not ready yet. Please wait a moment and try again.');
      }

      // Prepare data
      const utmData = getUTMData();
      const qrCodeId = typeof window !== 'undefined' ? localStorage.getItem('qr_code_id') : null;

      // 1) Create Razorpay order via backend
      // Pass full player data and UTM data so backend can handle registration
      // Backend validates amount, so we rely on backend to set strictly correct amount.
      // 1) Create Razorpay order via backend
      // Pass full player data and UTM data so backend can handle registration
      const { order, registrationId } = await razorpayService.createOrder({
        createRegistration: true,
        full_name: playerData.name,
        email: playerData.email,
        phone: playerData.contact,
        age: playerData.age,
        team: playerData.team,
        // UTM Tracking Data
        utm_source: utmData?.utm_source,
        utm_medium: utmData?.utm_medium,
        utm_campaign: utmData?.utm_campaign,
        utm_content: (utmData as any)?.utm_content,
        utm_term: (utmData as any)?.utm_term,
        qr_code_id: qrCodeId,
      });

      if (!order?.id) {
        throw new Error('Failed to create order. Please try again.');
      }

      // 2) Load Razorpay checkout
      // Backend returns Razorpay order object, so order.amount is in paise
      await razorpayService.initiatePayment({
        amountPaise: order.amount,
        orderId: order.id,
        customerName: playerData.name,
        customerEmail: playerData.email,
        customerPhone: playerData.contact,
        onDismiss: () => {
          setIsPaymentProcessing(false);
        },
        onSuccess: async (response: RazorpayPaymentSuccessResponse) => {
          try {
            // 3) Verify signature via backend
            await razorpayService.verifyPayment(
              response.razorpay_payment_id,
              response.razorpay_order_id,
              response.razorpay_signature,
              registrationId, // Mandatory now
            );

            // 4) Immediate Success Feedback
            alert('✅ Payment Verified and Player Registered Successfully!');

            // Reset form
            setPlayerData({
              name: '',
              email: '',
              contact: '',
              age: 0,
              team: '',
            });
            setIsPaymentProcessing(false);

            // Redirect immediately
            navigate('/registration/success');
          } catch (err) {
            console.error('Error in onSuccess:', err); // Log error but proceed if payment succeeded
            alert('Payment successful but verification failed. Please check your email for confirmation.');
            setIsPaymentProcessing(false);
            navigate('/registration/success');
          }
        },
        onFailure: (error: RazorpayPaymentFailedError) => {
          const msg = error?.description || error?.reason || 'Payment failed. Please try again.';
          alert(`❌ ${msg}`);
          setIsPaymentProcessing(false);
        },
      });
    } catch (err) {
      alert((err as Error)?.message || 'Something went wrong!');
      setIsPaymentProcessing(false);
    }
  };

  const isDisabled = isPaymentProcessing || isLoadingScript;

  return (
    <form onSubmit={handleSubmit} className="max-w-[400px] mx-auto">
      <h2>Player Registration</h2>

      {isLoadingScript && (
        <p className="mb-2.5 text-[#555] text-xs" aria-live="polite">
          Preparing secure payment...
        </p>
      )}
      {scriptLoadError && (
        <div className="mb-2.5 text-xs text-[crimson] space-y-2" role="alert" aria-live="assertive">
          <p>{scriptLoadError}</p>
          <button
            type="button"
            onClick={retryScriptLoad}
            className="text-[#2d89b8] underline"
          >
            Retry loading payment script
          </button>
        </div>
      )}

      <div className="mb-2.5">
        <label htmlFor="name">Name:</label>
        <input
          id="name"
          type="text"
          name="name"
          value={playerData.name}
          onChange={handleInputChange}
          placeholder="Enter your full name"
          autoComplete="name"
          required
          className="w-full p-2 text-black"
        />
      </div>

      <div className="mb-2.5">
        <label htmlFor="email">Email:</label>
        <input
          id="email"
          type="email"
          name="email"
          value={playerData.email}
          onChange={handleInputChange}
          placeholder="Enter your email address"
          autoComplete="email"
          required
          className="w-full p-2 text-black"
        />
      </div>

      <div className="mb-2.5">
        <label htmlFor="contact">Contact:</label>
        <input
          id="contact"
          type="tel"
          name="contact"
          value={playerData.contact}
          onChange={handleInputChange}
          placeholder="Enter 10-digit mobile number"
          pattern="[0-9]{10}"
          inputMode="numeric"
          maxLength={10}
          autoComplete="tel"
          title="Enter 10-digit mobile number"
          required
          aria-describedby="contact-help"
          className="w-full p-2 text-black"
        />
        <span id="contact-help" className="sr-only">Enter your 10-digit mobile number for registration and payment verification</span>
      </div>

      <div className="mb-2.5">
        <label htmlFor="age">Age:</label>
        <input
          id="age"
          type="number"
          name="age"
          value={playerData.age}
          onChange={handleInputChange}
          placeholder="Enter your age"
          inputMode="numeric"
          min={0}
          className="w-full p-2 text-black"
        />
      </div>

      <div className="mb-2.5">
        <label htmlFor="team">Team:</label>
        <input
          id="team"
          type="text"
          name="team"
          value={playerData.team}
          onChange={handleInputChange}
          placeholder="Enter team name (optional)"
          className="w-full p-2 text-black"
        />
      </div>

      <button
        type="submit"
        disabled={isDisabled}
        className={`px-5 py-2.5 w-full text-white rounded-[5px] ${isDisabled ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#3399cc] hover:bg-[#2d89b8] cursor-pointer'}`}
      >
        {isPaymentProcessing ? 'Processing...' : `Register & Pay Now (₹${displayAmount})`}
      </button>
    </form>
  );
};

export default SimplePlayerRegistrationForm;