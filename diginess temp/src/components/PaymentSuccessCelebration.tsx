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
} from 'lucide-react';
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

  const downloadReceipt = () => {
    // Track receipt download
    googleAnalytics.trackDownload('registration_receipt', `SSPL_Receipt_${playerDetails.full_name}_${paymentData.registrationId}.html`);

    const receiptData = {
      playerName: playerDetails.full_name,
      playerId: paymentData.registrationId,
      email: playerDetails.email,
      phone: playerDetails.phone,
      dateOfBirth: playerDetails.date_of_birth,
      position: playerDetails.position,
      state: playerDetails.state,
      city: playerDetails.city,
      pincode: playerDetails.pincode,
      preferredTrials: playerDetails.preferred_trials,
      paymentAmount: paymentData.amount,
      paymentId: paymentData.razorpay_payment_id,
      orderId: paymentData.razorpay_order_id,
      registrationDate: new Date().toLocaleDateString(),
    };

    // Sanitize user data to prevent XSS
    const sanitizeHTML = (str: string | undefined | null): string => {
      if (!str) return 'N/A';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
    };

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>SSPL T10 Registration Receipt</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #0066CC; padding-bottom: 20px; margin-bottom: 30px; }
            .logo-image { width: 100px; height: auto; margin-bottom: 10px; }
            .receipt-title { color: #FFD700; font-size: 18px; margin-top: 10px; }
            .details { margin: 20px 0; }
            .detail-row { display: flex; margin: 10px 0; }
            .label { font-weight: bold; width: 200px; }
            .value { flex: 1; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
            .status { padding: 5px 10px; border-radius: 4px; display: inline-block; }
            .status.completed { background: #d4edda; color: #155724; }
          </style>
        </head>
        <body>
          <div class="header">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" class="logo-image" role="img" aria-label="SSPL T10 Logo">
              <rect width="200" height="60" rx="8" fill="#0066CC"/>
              <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" fill="#FFD700">SSPL T10</text>
            </svg>
            <div class="receipt-title">Player Registration Receipt</div>
          </div>

          <div class="details">
            <div class="detail-row">
              <span class="label">Player ID:</span>
              <span class="value" style="font-weight: bold; color: #0066CC; font-family: monospace;">${sanitizeHTML(receiptData.playerId)}</span>
            </div>
            <div class="detail-row">
              <span class="label">Registration ID:</span>
              <span class="value">${sanitizeHTML(receiptData.playerId)}</span>
            </div>
            <div class="detail-row">
              <span class="label">Player Name:</span>
              <span class="value">${sanitizeHTML(receiptData.playerName)}</span>
            </div>
            <div class="detail-row">
              <span class="label">Email:</span>
              <span class="value">${sanitizeHTML(receiptData.email)}</span>
            </div>
            <div class="detail-row">
              <span class="label">Phone:</span>
              <span class="value">${sanitizeHTML(receiptData.phone)}</span>
            </div>
            <div class="detail-row">
              <span class="label">Date of Birth:</span>
              <span class="value">${sanitizeHTML(receiptData.dateOfBirth)}</span>
            </div>
            <div class="detail-row">
              <span class="label">Player Type:</span>
              <span class="value">${sanitizeHTML(receiptData.position)}</span>
            </div>
            <div class="detail-row">
              <span class="label">State:</span>
              <span class="value">${sanitizeHTML(receiptData.state)}</span>
            </div>
            <div class="detail-row">
              <span class="label">City:</span>
              <span class="value">${sanitizeHTML(receiptData.city)}</span>
            </div>
            <div class="detail-row">
              <span class="label">PIN Code:</span>
              <span class="value">${sanitizeHTML(receiptData.pincode)}</span>
            </div>
            ${receiptData.preferredTrials ? `
            <div class="detail-row">
              <span class="label">Preferred Trials:</span>
              <span class="value">${sanitizeHTML(receiptData.preferredTrials)}</span>
            </div>
            ` : ''}
            <div class="detail-row">
              <span class="label">Payment Amount:</span>
              <span class="value">₹${sanitizeHTML(String(receiptData.paymentAmount))}</span>
            </div>
            <div class="detail-row">
              <span class="label">Payment ID:</span>
              <span class="value" style="font-family: monospace;">${sanitizeHTML(receiptData.paymentId)}</span>
            </div>
            <div class="detail-row">
              <span class="label">Order ID:</span>
              <span class="value" style="font-family: monospace;">${sanitizeHTML(receiptData.orderId)}</span>
            </div>
            <div class="detail-row">
              <span class="label">Payment Status:</span>
              <span class="value">
                <span class="status completed">Completed</span>
              </span>
            </div>
            <div class="detail-row">
              <span class="label">Registration Date:</span>
              <span class="value">${sanitizeHTML(receiptData.registrationDate)}</span>
            </div>
          </div>

          <div class="footer">
            <p>Thank you for registering with SSPL T10!</p>
            <p>This receipt confirms your player registration details.</p>
          </div>
        </body>
      </html>
    `;

    const blob = new Blob([receiptHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SSPL_Receipt_${playerDetails.full_name}_${paymentData.registrationId}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
            <Card className="mb-4 border-green-200 bg-green-50">
              <CardContent className="p-3">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                  <h3 className="text-lg font-bold text-green-800">Player Details</h3>
                  <Trophy className="w-6 h-6 text-yellow-500" />
                </div>

                <div className="grid grid-cols-2 gap-3 text-left">
                  <div className="space-y-2">
                    <p><strong>Player ID:</strong> <span className="font-mono text-blue-600">{paymentData.registrationId}</span></p>
                    <p><strong>Name:</strong> {playerDetails.full_name}</p>
                    <p><strong>Email:</strong> {playerDetails.email}</p>
                    <p><strong>Phone:</strong> {playerDetails.phone}</p>
                  </div>
                  <div className="space-y-2">
                    <p><strong>Position:</strong> <Badge variant="secondary">{playerDetails.position}</Badge></p>
                    <p><strong>Location:</strong> {playerDetails.city}, {playerDetails.state}</p>
                    <p><strong>Payment ID:</strong> <span className="font-mono text-sm">{paymentData.razorpay_payment_id}</span></p>
                    <p><strong>Amount Paid:</strong> <span className="font-bold text-green-600">₹{paymentData.amount}</span></p>
                  </div>
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
              >
                <FileText className="w-4 h-4" />
                Download Receipt
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