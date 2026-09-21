import React from 'react';
import MarqueeRibbon from '@/components/MarqueeRibbon';
import { CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const RegistrationSuccess: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MarqueeRibbon />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto text-center space-y-6">
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-green-700">Payment Successful!</h1>
            <p className="text-muted-foreground mt-2">
              Your registration has been confirmed. A confirmation email/receipt will be sent to your registered email.
            </p>
          </div>

          <div className="pt-2 space-y-3">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-md bg-cricket-blue px-4 py-2 text-white hover:bg-cricket-dark-blue transition-colors"
            >
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationSuccess;