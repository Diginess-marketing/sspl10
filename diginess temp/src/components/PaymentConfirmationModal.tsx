import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  CreditCard,
  Shield,
  Loader2,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
import { razorpayService, type RazorpayPaymentFailedError, type RazorpayPaymentSuccessResponse } from '@/integrations/razorpayService';
import { useEnhancedModal } from '@/hooks/useEnhancedModal';

interface PlayerDetails {
  full_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  state: string;
  city: string;
  position: string;
  pincode: string;
}

interface PaymentConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  onSuccess: (paymentData: any) => void;
  onFailure: (paymentError: any) => void;
  playerDetails: PlayerDetails;
  registrationFee: number;
  gstPercentage: number;
  registrationId?: string; // Made optional as registration might be handled by backend during order creation
  paymentProcessing?: boolean;
}

const PaymentConfirmationModal: React.FC<PaymentConfirmationModalProps> = ({
  isOpen,
  onClose,
  onBack,
  onSuccess,
  onFailure,
  playerDetails,
  registrationFee,
  gstPercentage,
  registrationId,
  paymentProcessing = false,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [razorpayModalOpen, setRazorpayModalOpen] = useState(false);
  const [scriptLoadError, setScriptLoadError] = useState<string | null>(null);
  const [scriptLoadAttempts, setScriptLoadAttempts] = useState(0);
  const [paymentCancelled, setPaymentCancelled] = useState(false);
  const { toast } = useToast();

  // Fetch backend config for correct amount display
  const [config, setConfig] = useState<{ amount: number; amount_paise: number } | null>(null);

  useEffect(() => {
    razorpayService.getConfig().then(data => {
      if (data) setConfig(data);
    }).catch(console.error);
  }, []);

  // Use config amount if available, else props (fallback)
  const isConfigTotal = Boolean(config?.amount);
  const configTotal = config?.amount ?? 0;

  // If config is present, we treat it as the Total Payable amount (e.g. 825).
  // We back-calculate the Base.
  // Base = Total * 100 / (100 + gst)
  // GST = Total - Base
  const calculatedBase = isConfigTotal
    ? Math.round((configTotal * 100) / (100 + gstPercentage))
    : registrationFee;

  const baseFee = calculatedBase;
  const gstAmount = isConfigTotal
    ? (configTotal - baseFee)
    : Math.round(baseFee * gstPercentage / 100);

  const totalAmount = isConfigTotal ? configTotal : (baseFee + gstAmount);

  // Function to load Razorpay script with retry logic
  const loadRazorpayScript = () => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      setRazorpayLoaded(true);
      setScriptLoadError(null);
      return;
    }
    setRazorpayLoaded(false);
    setScriptLoadError(null);

    // Check if script is already in DOM to prevent duplicates
    if (document.querySelector('#razorpay-js')) {
      return;
    }

    const script = document.createElement('script');
    script.id = 'razorpay-js';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      setRazorpayLoaded(true);
      setScriptLoadError(null);
      setScriptLoadAttempts(0);
    };
    script.onerror = () => {
      const errorMsg = 'Failed to load payment system. Please check your internet connection.';
      setScriptLoadError(errorMsg);
      setPaymentError(errorMsg);
      setScriptLoadAttempts(prev => prev + 1);
    };

    document.body.appendChild(script);
  };

  // Preload Razorpay script when modal opens
  useEffect(() => {
    if (isOpen) {
      loadRazorpayScript();
    }
  }, [isOpen]);

  // Retry function for script loading
  const retryScriptLoad = () => {
    loadRazorpayScript();
  };

  // Reset states when modal closes
  useEffect(() => {
    if (!isOpen) {
      setRazorpayModalOpen(false);
      setIsProcessing(false);
      setPaymentError(null);
      setScriptLoadError(null);
      setScriptLoadAttempts(0);
      setPaymentCancelled(false);
      // Close any existing Razorpay instance
      razorpayService.closeModal();
    }
  }, [isOpen]);

  // Enhanced modal controls
  useEnhancedModal({
    enableEscapeKey: true,
    enableClickOutside: true,
    onClose,
  });

  const handlePayment = async () => {
    try {
      setIsProcessing(true);
      setPaymentError(null);
      setPaymentCancelled(false);

      // Close any open select dropdowns to prevent overlapping
      const openSelects = document.querySelectorAll('select:focus');
      openSelects.forEach(select => {
        (select as HTMLSelectElement).blur();
      });

      // Create Razorpay order via backend
      const payload: any = {
        // If we have specific player details needed for creating reg:
        full_name: playerDetails.full_name,
        email: playerDetails.email,
        phone: playerDetails.phone,
        state: playerDetails.state,
        city: playerDetails.city,
        position: playerDetails.position,
        pincode: playerDetails.pincode,
        date_of_birth: playerDetails.date_of_birth,
      };

      if (registrationId) {
        payload.registrationId = registrationId;
      } else {
        payload.createRegistration = true;
      }

      // Backend enforces amount. We don't send amount.
      // Backend enforces amount. We don't send amount.
      const { order, registrationId: newRegistrationId } = await razorpayService.createOrder(payload);

      // Initiate payment
      setRazorpayModalOpen(true);

      // Razorpay order.amount is in paise
      await razorpayService.initiatePayment({
        amountPaise: order.amount,
        orderId: order.id,
        customerName: playerDetails.full_name,
        customerEmail: playerDetails.email,
        customerPhone: playerDetails.phone,
        onDismiss: () => {
          setRazorpayModalOpen(false);
          setPaymentCancelled(true);
        },
        onSuccess: async (response: RazorpayPaymentSuccessResponse) => {
          setRazorpayModalOpen(false);

          try {
            // Verify payment signature
            await razorpayService.verifyPayment(
              response.razorpay_payment_id,
              response.razorpay_order_id,
              response.razorpay_signature,
              newRegistrationId || registrationId || '',
            );

            // Immediate success feedback
            onSuccess({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              amount: order.amount / 100,
              registrationId: newRegistrationId || registrationId,
            });

          } catch (verificationError) {
            setPaymentError('Payment verification failed. Please check your email for confirmation.');
            toast({
              title: 'Verification Failed',
              description: 'Payment was successful but verification failed. Please contact support with your payment ID.',
              variant: 'destructive',
            });
          }
        },
        onFailure: async (error: RazorpayPaymentFailedError) => {
          setRazorpayModalOpen(false);
          setPaymentError(error?.description || error?.reason || 'Payment failed. Please try again.');

          onFailure({
            razorpay_payment_id: error?.metadata?.payment_id ?? null,
            razorpay_order_id: error?.metadata?.order_id ?? null,
            description: error?.description || error?.reason || 'Payment failed',
            error,
          });
        },
      });

    } catch (error: any) {
      let errorMessage = 'Failed to initiate payment. Please try again.';
      if (error?.description) {
        errorMessage = error.description;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      setPaymentError(errorMessage);
      toast({
        title: 'Payment Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm max-h-[85vh] overflow-y-auto p-6" aria-describedby="payment-modal-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <CreditCard className="w-4 h-4 text-blue-600" />
            Complete Your Payment
          </DialogTitle>
          <DialogDescription id="payment-modal-description" className="text-xs">
            Review your payment details and complete the transaction securely using Razorpay payment gateway.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 relative">
          {/* Backdrop overlay when Razorpay is active */}
          {razorpayModalOpen && (
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm z-10 pointer-events-none rounded-lg" />
          )}

          {/* Razorpay Loading/Error Indicator */}
          {!razorpayLoaded && !scriptLoadError && (
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <div>
                  <h4 className="font-medium text-blue-800 text-sm">Preparing Payment</h4>
                  <p className="text-xs text-blue-700">Loading secure payment system...</p>
                </div>
              </div>
            </div>
          )}

          {/* Script Load Error */}
          {scriptLoadError && (
            <div className="bg-red-50 p-3 rounded-lg border border-red-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-red-800 text-sm">Payment System Error</h4>
                  <p className="text-xs text-red-700 mb-2">{scriptLoadError}</p>
                  <Button
                    onClick={retryScriptLoad}
                    size="sm"
                    variant="outline"
                    className="text-xs h-7"
                    disabled={scriptLoadAttempts >= 3}
                  >
                    {scriptLoadAttempts >= 3 ? 'Max retries reached' : 'Retry Loading'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Payment Summary Card */}
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-3">
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Shield className="w-3 h-3 text-blue-600" />
                Payment Summary
              </h3>

              <div className="space-y-1">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span>Total Amount to be Paid</span>
                  <span className="text-blue-600">₹{totalAmount}</span>
                </div>
                <div className="text-xs text-gray-600 space-y-0.5">
                  <p>Registration Fee: ₹{baseFee}</p>
                  <p>GST ({gstPercentage}%): ₹{gstAmount}</p>
                  <p className="border-t pt-0.5 font-medium">Total: ₹{totalAmount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Player Details Summary */}
          <Card>
            <CardContent className="p-2">
              <h4 className="font-medium text-xs mb-1">Player Details</h4>
              <div className="text-xs text-gray-600 space-y-0.5">
                <p><strong>Name:</strong> {playerDetails.full_name}</p>
                <p><strong>Email:</strong> {playerDetails.email}</p>
                <p><strong>Position:</strong> <Badge variant="outline" className="text-xs">{playerDetails.position}</Badge></p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Security Notice */}
          <div className="bg-green-50 p-2 rounded-lg border border-green-200">
            <div className="flex items-start gap-2">
              <Shield className="w-3 h-3 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-800 text-xs mb-0.5">Secure Payment</h4>
                <p className="text-xs text-green-700">
                  Your payment is processed securely through Razorpay with industry-standard encryption.
                  We do not store your payment information.
                </p>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {paymentError && (
            <div className="bg-red-50 p-2 rounded-lg border border-red-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-3 h-3 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-800 text-xs mb-0.5">Payment Error</h4>
                  <p className="text-xs text-red-700">{paymentError}</p>
                </div>
              </div>
            </div>
          )}

          {/* Payment Cancelled Message */}
          {paymentCancelled && !paymentError && (
            <div className="bg-yellow-50 p-2 rounded-lg border border-yellow-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-3 h-3 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800 text-xs mb-0.5">Payment Cancelled</h4>
                  <p className="text-xs text-yellow-700">You cancelled the payment. You can try again or go back to edit your details.</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-3">
            <Button
              variant="outline"
              onClick={onBack}
              disabled={isProcessing}
              className="flex items-center gap-2 text-sm"
            >
              <ArrowLeft className="w-3 h-3" />
              Back to Review
            </Button>

            <Button
              onClick={handlePayment}
              disabled={isProcessing || !razorpayLoaded || Boolean(scriptLoadError)}
              className="flex-1 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-sm"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Processing...
                </>
              ) : scriptLoadError ? (
                <>
                  <AlertCircle className="w-3 h-3" />
                  Payment Unavailable
                </>
              ) : !razorpayLoaded ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Loading Payment...
                </>
              ) : (
                <>
                  <CreditCard className="w-3 h-3" />
                  Pay ₹{totalAmount}
                </>
              )}
            </Button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentConfirmationModal;