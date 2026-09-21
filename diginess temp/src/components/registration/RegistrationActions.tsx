import React from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, Trophy } from 'lucide-react';
import { EnhancedButton, LoadingSpinner } from '@/components/ui/enhanced-components';
import TermsAndConditions from '../TermsAndConditions';
import PrivacyPolicy from '../PrivacyPolicy';

interface RegistrationActionsProps {
  isSubmitting: boolean;
  isOnline: boolean;
  adminSettings: any;
}

const RegistrationActions: React.FC<RegistrationActionsProps> = ({
  isSubmitting,
  isOnline,
  adminSettings,
}) => {
  return (
    <>
      {/* Submit Button */}
      <div className="pt-3 border-t border-emerald-200/50 shrink-0">
        <EnhancedButton
          type="submit"
          variant="cricket"
          className="w-full flex items-center justify-center gap-2 px-4 py-3 h-auto text-sm font-semibold bg-linear-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 border-0 shadow-lg"
          disabled={isSubmitting || !isOnline}
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner size="sm" color="white" />
              Processing...
            </>
          ) : !isOnline ? (
            <>
              <UserPlus className="w-4 h-4" />
              No Internet Connection
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              Complete Registration
            </>
          )}
        </EnhancedButton>
      </div>

      {/* Registration Fee Display */}
      {adminSettings && (
        <div className="mb-3 p-4 bg-linear-to-r from-emerald-50 to-blue-50 rounded-lg border border-emerald-200/50 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-linear-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center shadow-sm">
                <Trophy className="w-3 h-3 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-emerald-800 text-sm">Registration Fee</h4>
                <p className="text-xs text-emerald-600 font-medium">Includes GST</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-black text-emerald-800">
                ₹{Math.round(adminSettings.registration_fee * (1 + adminSettings.gst_percentage / 100))}
              </div>
              <div className="text-xs text-emerald-600 font-semibold">
                Total Amount (incl. GST)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Terms and Conditions */}
      <div className="mt-3 text-center text-xs text-emerald-700 font-medium shrink-0">
        <div className="flex justify-center items-center gap-1 flex-wrap px-2">
          <span className="text-emerald-600 font-semibold">By registering, you agree to our</span>
          <TermsAndConditions asLink />
          <span className="text-emerald-600 font-semibold">&</span>
          <PrivacyPolicy asLink />
        </div>
      </div>
    </>
  );
};

export default RegistrationActions;