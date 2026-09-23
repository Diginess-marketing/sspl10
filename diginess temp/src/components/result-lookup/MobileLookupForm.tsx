import React, { useState, useRef } from 'react';
import { Search, Phone, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { TrialLookupFormData, TrialLookupFormErrors } from '@/types/resultLookup';

interface MobileLookupFormProps {
  onSubmit: (formData: TrialLookupFormData) => Promise<boolean>;
  isLoading: boolean;
  className?: string;
}

const MobileLookupForm: React.FC<MobileLookupFormProps> = ({
  onSubmit,
  isLoading,
  className = '',
}) => {
  const [formData, setFormData] = useState<TrialLookupFormData>({
    mobile: '',
  });

  const [errors, setErrors] = useState<TrialLookupFormErrors>({});
  const [touched, setTouched] = useState<{[key: string]: boolean}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (value: string) => {
    setFormData({ mobile: value });

    // Clear error when user starts typing
    if (errors.mobile) {
      setErrors({ mobile: undefined });
    }

    // Mark field as touched
    setTouched({ mobile: true });
  };

  const validateForm = (): boolean => {
    const newErrors: TrialLookupFormErrors = {};

    if (!formData.mobile?.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else {
      const mobileRegex = /^[6-9]\d{9}$/;
      if (!mobileRegex.test(formData.mobile.trim())) {
        newErrors.mobile = 'Please enter a valid 10-digit mobile number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await onSubmit(formData);
      if (success) {
        // Clear form on success
        setFormData({ mobile: '' });
        setTouched({});
        setErrors({});
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={`w-full max-w-md mx-auto ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Search className="w-5 h-5 text-blue-600" />
          Lookup Trial Results
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mobile Number Input */}
          <div className="space-y-2">
            <Label htmlFor="mobile" className="text-sm font-medium flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Mobile Number
              <span className="text-red-500">*</span>
            </Label>
            <Input
              ref={inputRef}
              id="mobile"
              type="tel"
              value={formData.mobile}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Enter 10-digit mobile number"
              className={`w-full ${errors.mobile ? 'border-red-400 focus:border-red-500' : ''}`}
              disabled={isLoading || isSubmitting}
              maxLength={10}
              aria-describedby={errors.mobile ? 'mobile-error' : undefined}
              aria-invalid={Boolean(errors.mobile)}
            />

            {errors.mobile && (
              <p id="mobile-error" className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.mobile}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || isSubmitting}
            size="lg"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Lookup Results
              </>
            )}
          </Button>
        </form>

        {/* Helper Text */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-800">
            <strong>Tips:</strong> Enter your registered mobile number to view your trial results.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MobileLookupForm;