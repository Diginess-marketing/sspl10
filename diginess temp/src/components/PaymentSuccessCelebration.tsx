import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
// import { supabase } from '@/integrations/supabase/client'; // Removed
import { googleAnalytics } from '@/utils/googleAnalytics';
import {
  CheckCircle,
  Trophy,
  Share2,
  Home,
  FileText,
  Loader2,
} from 'lucide-react';
import { downloadRegistrationReceipt } from '@/lib/registrationReceipt';
import './PaymentSuccessCelebration.css';

interface PlayerDetails {
  full_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  state: string;
  city: string;
  position: string;
  pincode: string;
  preferred_trials?: string;
  school_name?: string;
}

interface PaymentSuccessCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  playerDetails: PlayerDetails;
  paymentData: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    amount: number;
    registrationId: string;
  };
  /** Local preview URL of the photo the player uploaded, if any. */
  photoUrl?: string | null;
  /** The photo file itself; the receipt reads this directly, so it never depends on the preview URL. */
  photoFile?: Blob | null;
}

interface ConfettiPiece {
  id: number;
  leftClass: string;
  topClass: string;
  delayClass: string;
  durationClass: string;
  colorClass: string;
}

const PaymentSuccessCelebration: React.FC<PaymentSuccessCelebrationProps> = ({
  isOpen,
  onClose,
  playerDetails,
  paymentData,
  photoUrl,
  photoFile,
}) => {
  const [showConfetti, setShowConfetti] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [isClosing, setIsClosing] = useState(false);
  const [confettiPieces, setConfettiPieces] = useState<ConfettiPiece[]>([]);
  // const [statusUpdated, setStatusUpdated] = useState(false); // Removed

  // Removed useEffect for updatePaymentStatus (Supabase writes not allowed)

  useEffect(() => {
    if (isOpen) {
      // Generate confetti pieces
      const pieces: ConfettiPiece[] = Array.from({ length: 10 }, (_, i) => {
        const colorClasses = ['bg-yellow-400', 'bg-blue-600', 'bg-green-500', 'bg-red-500', 'bg-purple-600'];
        const randomColor = colorClasses[Math.floor(Math.random() * colorClasses.length)];

        // Quantize values to avoid inline style usage; map to predefined CSS classes
        const left = Math.round(Math.random() * 10) * 10; // 0..100 step 10
        const top = Math.round(Math.random() * 10) * 10; // 0..100 step 10
        const delayOptions = [0, 500, 1000, 1500, 2000, 2500, 3000];
        const durationOptions = [2000, 2500, 3000, 3500, 4000];
        const delay = delayOptions[Math.floor(Math.random() * delayOptions.length)];
        const duration = durationOptions[Math.floor(Math.random() * durationOptions.length)];

        return {
          id: i,
          leftClass: `confetti-left-${left}`,
          topClass: `confetti-top-${top}`,
          delayClass: `confetti-delay-${delay}`,
          durationClass: `confetti-duration-${duration}`,
          colorClass: randomColor,
        };
      });
      setConfettiPieces(pieces);

      // Auto-advance through celebration steps
      const steps = [0, 1, 2, 3];
      let stepIndex = 0;

      const stepTimer = setInterval(() => {
        stepIndex = (stepIndex + 1) % steps.length;
        setCurrentStep(stepIndex);
      }, 2000);

      // Stop confetti after 5 seconds
      const confettiTimer = setTimeout(() => {
        setShowConfetti(false);
      }, 5000);

      return () => {
        clearInterval(stepTimer);
        clearTimeout(confettiTimer);
      };
    }
  }, [isOpen]);

  const [isDownloading, setIsDownloading] = useState(false);

  const downloadReceipt = async () => {
    googleAnalytics.trackDownload('registration_receipt', `SSPL_Receipt_${paymentData.registrationId}.pdf`);
    setIsDownloading(true);
    try {
      await downloadRegistrationReceipt({
        registrationId: paymentData.registrationId,
        fullName: playerDetails.full_name,
        email: playerDetails.email,
        phone: playerDetails.phone,
        dateOfBirth: playerDetails.date_of_birth,
        position: playerDetails.position,
        city: playerDetails.city,
        state: playerDetails.state,
        pincode: playerDetails.pincode,
        preferredTrials: playerDetails.preferred_trials,
        schoolName: playerDetails.school_name,
        amount: paymentData.amount,
        paymentId: paymentData.razorpay_payment_id,
        orderId: paymentData.razorpay_order_id,
        photo: photoFile ?? photoUrl,
      });
    } catch (error) {
      console.error('Receipt download failed', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const hasNativeShare = (): boolean => {
    // Feature-detect using in-operator to avoid checking a function reference directly
    return typeof (navigator as any)?.share === 'function';
  };

  const shareRegistration = async () => {
    const canShare = hasNativeShare();
    const shareMethod = canShare ? 'native_share' : 'clipboard_copy';

    // Track share action
    googleAnalytics.trackShare(shareMethod, 'registration_success');

    if (canShare) {
      try {
        await (navigator as any).share({
          title: 'SSPL T10 Player Registration',
          text: `I just registered as a player for SSPL T10! Player ID: ${paymentData.registrationId}`,
          url: window.location.href,
        });
      } catch (err) {
        // User may cancel the share sheet; that's not an error condition for us
        // Silently ignore or log for diagnostics
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(
          `I just registered as a player for SSPL T10! Player ID: ${paymentData.registrationId}`,
        );
      } catch (err) {
      }
    }
  };

  const handleClose = async () => {
    setIsClosing(true);
    try {
      await onClose();
    } catch (error) {
    } finally {
      setIsClosing(false);
    }
  };

  const celebrationMessages = [
    '🎉 Welcome to SSPL T10!',
    '🏏 Your cricket journey begins now!',
    "⭐ You're officially a player!",
    '🎊 Registration complete!',
  ];

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        // Only invoke onClose when the dialog requests closing
        if (!open) onClose();
      }}
    >
      <DialogContent className="w-[96vw] max-w-3xl h-auto max-h-[82vh] overflow-y-auto p-4 md:p-6">
        <DialogHeader>
          <DialogTitle className="sr-only">Payment Success - Player Registration Complete</DialogTitle>
          <DialogDescription className="sr-only">
            Congratulations! Your player registration for SSPL T10 has been completed successfully. Your payment has been processed and you can now download your receipt or share your registration details.
          </DialogDescription>
        </DialogHeader>
        <div className="relative">
          {/* Animated Background */}
          <div className="celebration-background"></div>

          {/* Confetti Animation */}
          {showConfetti && (
            <div className="confetti-container">
              {confettiPieces.map((piece) => (
                <div
                  key={piece.id}
                  className={`confetti-piece ${piece.leftClass} ${piece.topClass} ${piece.delayClass} ${piece.durationClass}`}
                >
                  <div className={`w-2 h-2 rounded-full ${piece.colorClass}`} />
                </div>
              ))}
            </div>
          )}

          <div className="relative z-10 p-4 md:p-6 text-center">
            {/* Success Icon */}
            <div className="mb-4">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 animate-bounce">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-green-600 mb-1">
                {celebrationMessages[currentStep]}
              </h2>
              <p className="text-gray-600 text-sm">
                Your registration has been confirmed successfully!
              </p>
            </div>

            {/* Player Details Card */}
            {/* Explicit !text-* colours: the site's global styles otherwise turn this text white. */}
            <Card className="mb-4 border-white/60 !bg-white shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                  <h3 className="!text-lg font-bold !text-[#0a1240]">Player Details</h3>
                  <Trophy className="w-6 h-6 text-yellow-500" />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start text-left">
                  {photoUrl ? (
                    <img src={photoUrl} alt={playerDetails.full_name} className="w-24 h-28 rounded-xl object-cover object-top shrink-0 border-4 border-[#eef5ff]" />
                  ) : (
                    <div className="w-24 h-28 rounded-xl bg-[#eef5ff] shrink-0 flex items-center justify-center !text-4xl font-bold !text-[#1f57d6]" aria-hidden="true">
                      {(playerDetails.full_name?.trim()[0] || '?').toUpperCase()}
                    </div>
                  )}
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 flex-1 min-w-0 !text-sm !text-[#0a1240]">
                    <div className="sm:col-span-2"><dt className="inline font-bold">Player ID: </dt><dd className="inline font-mono !text-[#1f57d6] break-all">{paymentData.registrationId}</dd></div>
                    <div><dt className="inline font-bold">Name: </dt><dd className="inline">{playerDetails.full_name}</dd></div>
                    <div><dt className="inline font-bold">Position: </dt><dd className="inline"><Badge variant="secondary">{playerDetails.position}</Badge></dd></div>
                    <div className="min-w-0"><dt className="inline font-bold">Email: </dt><dd className="inline break-all">{playerDetails.email}</dd></div>
                    <div><dt className="inline font-bold">Phone: </dt><dd className="inline">{playerDetails.phone}</dd></div>
                    <div className="sm:col-span-2"><dt className="inline font-bold">Location: </dt><dd className="inline">{playerDetails.city}, {playerDetails.state}</dd></div>
                    <div className="min-w-0"><dt className="inline font-bold">Payment ID: </dt><dd className="inline font-mono break-all">{paymentData.razorpay_payment_id || '—'}</dd></div>
                    <div><dt className="inline font-bold">Amount Paid: </dt><dd className="inline font-bold !text-green-700">₹{paymentData.amount}</dd></div>
                  </dl>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => {
                  googleAnalytics.trackButtonClick('download_receipt', 'payment_success_modal');
                  downloadReceipt();
                }}
                variant="outline"
                className="flex items-center gap-2"
                disabled={isDownloading}
              >
                {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                {isDownloading ? 'Preparing PDF…' : 'Download Receipt'}
              </Button>

              <Button
                onClick={() => {
                  googleAnalytics.trackButtonClick('share_registration', 'payment_success_modal');
                  shareRegistration();
                }}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share
              </Button>

              <Button
                onClick={() => {
                  googleAnalytics.trackButtonClick('go_to_home', 'payment_success_modal');
                  handleClose();
                }}
                disabled={isClosing}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                {isClosing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Closing...
                  </>
                ) : (
                  <>
                    <Home className="w-4 h-4" />
                    Go to Home
                  </>
                )}
              </Button>
            </div>

            {/* Additional Celebrations */}

          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentSuccessCelebration;