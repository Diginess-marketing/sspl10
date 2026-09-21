import React from 'react';
import { Label } from '@/components/ui/label';
import { Calendar, User } from 'lucide-react';
import { EnhancedInput } from '@/components/ui/enhanced-components';

interface PersonalInfoSectionProps {
  formData: Record<string, string>;
  handleInputChange: (fieldName: string, value: any) => void;
  validateField: (fieldName: string, fieldValue: string) => void;
}

const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({
  formData,
  handleInputChange,
  validateField,
}) => {
  return (
    <div className="bg-linear-to-r from-emerald-50 to-teal-50 p-3 rounded-lg border border-emerald-200/50 shadow-sm">
      <h3 className="text-base font-bold text-emerald-800 mb-3 flex items-center gap-2">
        <User className="w-4 h-4 text-emerald-600" />
        Personal Information
      </h3>
      <div className="space-y-2">
        {/* Full Name Input */}
        <div className="space-y-2">
          <Label htmlFor="full_name" className="text-emerald-700 font-semibold text-sm flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-emerald-600" />
            Full Name
          </Label>
          <EnhancedInput
            id="full_name"
            type="text"
            placeholder="Enter your full name"
            value={formData.full_name || ''}
            onChange={(e) => {
              const inputValue = e.target.value;
              handleInputChange('full_name', inputValue);
            }}
            required={false}
            leftIcon={<User className="w-3 h-3" />}
            animated={true}
            className="text-sm"
          />
        </div>

        {/* Date of Birth */}
        <div className="space-y-2">
          <Label htmlFor="date_of_birth" className="text-emerald-700 font-semibold text-sm flex items-center gap-2 drop-shadow-sm">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            Date of Birth
          </Label>
          <div className="relative">
            {/* Date Input with Enhanced Styling */}
            <div className="space-y-2">
              {/* Modern browsers with date picker */}
              <div className="relative">
                <input
                  id="date_of_birth"
                  type="date"
                  value={formData.date_of_birth || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    handleInputChange('date_of_birth', value);
                  }}
                  onFocus={(e) => {
                    // Force the date picker to show on mobile devices
                    if (e.target.type === 'date') {
                      e.target.showPicker?.();
                    }
                  }}
                  placeholder="Select your date of birth"
                  className="w-full h-10 px-3 py-2 pr-10 text-sm border border-emerald-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white cursor-pointer transition-all duration-200 hover:border-emerald-400"
                  autoComplete="bday"
                />

                {/* Calendar icon overlay */}
                <div
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400 hover:text-emerald-500 transition-colors"
                  onClick={() => {
                    const input = document.getElementById('date_of_birth') as HTMLInputElement;
                    if (input) {
                      input.focus();
                      input.showPicker?.();
                    }
                  }}
                >
                  <Calendar className="w-4 h-4" />
                </div>
              </div>

              {/* Helper text */}
              <p className="text-xs text-gray-500">
                Click the calendar icon to select your date of birth
              </p>

              {/* Error display */}
              {formData.date_of_birth_error && (
                <p className="text-sm text-red-600">{formData.date_of_birth_error}</p>
              )}

              {/* Success display */}
              {formData.date_of_birth_success && (
                <p className="text-sm text-green-600">{formData.date_of_birth_success}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoSection;