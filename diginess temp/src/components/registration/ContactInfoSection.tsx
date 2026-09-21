import React from 'react';
import { Label } from '@/components/ui/label';
import { Mail, Phone } from 'lucide-react';
import { EnhancedInput } from '@/components/ui/enhanced-components';

interface ContactInfoSectionProps {
  formData: Record<string, string>;
  handleInputChange: (fieldName: string, value: any) => void;
  validateField: (fieldName: string, fieldValue: string) => void;
}

const ContactInfoSection: React.FC<ContactInfoSectionProps> = ({
  formData,
  handleInputChange,
  validateField,
}) => {
  return (
    <div className="bg-linear-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-200/50">
      <h4 className="text-sm font-bold text-blue-800 mb-3 flex items-center gap-2">
        <Mail className="w-4 h-4 text-blue-600" />
        Contact Details
      </h4>
      <div className="grid grid-cols-1 gap-2">
        {/* Email Input */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-blue-700 font-semibold text-sm flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-blue-600" />
            Email Address
          </Label>
          <EnhancedInput
            id="email"
            type="email"
            placeholder="Enter your email address"
            value={formData.email || ''}
            onChange={(e) => {
              const inputValue = e.target.value;
              handleInputChange('email', inputValue);
              validateField('email', inputValue);
            }}
            error={formData.email_error || ''}
            success={formData.email_success || ''}
            required={false}
            leftIcon={<Mail className="w-3 h-3" />}
            className="text-sm"
          />
        </div>

        {/* Phone Input */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-blue-700 font-semibold text-sm flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-blue-600" />
            Phone Number
          </Label>
          <div className="relative">
            {/* +91 prefix with improved visibility */}
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-700 font-bold z-20 bg-white px-1 text-sm">
              +91
            </div>
            {/* Phone input field with better padding */}
            <input
              id="phone"
              type="tel"
              value={formData.phone || ''}
              onChange={(e) => {
                const inputValue = e.target.value.replace(/\D/g, ''); // Only allow digits
                if (inputValue.length <= 10) { // Limit to 10 digits
                  handleInputChange('phone', inputValue);
                  validateField('phone', inputValue);
                }
              }}
              placeholder="Enter 10-digit mobile number"
              className="w-full h-10 pl-16 pr-3 py-2 text-sm border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white cursor-text transition-all duration-200 hover:border-blue-400"
              maxLength={10}
              autoComplete="tel"
            />
            {/* Visual separator line */}
            <div className="absolute left-12 top-1/2 transform -translate-y-1/2 w-px h-6 bg-blue-300"></div>
          </div>
          {/* Error display */}
          {formData.phone_error && (
            <p className="text-sm text-red-600">{formData.phone_error}</p>
          )}
          {/* Success display */}
          {formData.phone_success && (
            <p className="text-sm text-green-600">{formData.phone_success}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactInfoSection;