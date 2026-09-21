import React, { useState } from 'react';
import { Search, User, Phone, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { PlayerLookupFormData, PlayerLookupFormErrors } from '@/types/playerData';

interface PlayerSearchFormProps {
  onSubmit: (data: PlayerLookupFormData) => Promise<boolean>;
  searchTypeOptions?: Array<'mobile' | 'name'>;
  isLoading?: boolean;
  className?: string;
}

const PlayerSearchForm: React.FC<PlayerSearchFormProps> = ({
  onSubmit,
  searchTypeOptions: allowedSearchTypes = ['mobile'],
  isLoading = false,
  className = '',
}) => {
  const [formData, setFormData] = useState<PlayerLookupFormData>({
    searchType: allowedSearchTypes[0] || 'mobile',
    searchValue: '',
  });

  const [errors, setErrors] = useState<PlayerLookupFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const allSearchTypeOptions = [
    { value: 'mobile', label: 'Mobile Number', icon: Phone, placeholder: 'Enter 10-digit mobile number' },
    { value: 'name', label: 'Name', icon: User, placeholder: 'Enter player name' },
  ];

  const searchTypeOptions = allSearchTypeOptions.filter(option => allowedSearchTypes.includes(option.value as 'mobile' | 'name'));

  const getCurrentSearchType = () => {
    return searchTypeOptions.find(option => option.value === formData.searchType) || searchTypeOptions[0];
  };

  const handleInputChange = (field: keyof PlayerLookupFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error for searchValue when user starts typing
    if (field === 'searchValue' && (errors as any).searchValue) {
      setErrors(prev => ({ ...prev, searchValue: undefined }));
    }
  };

  const validateForm = (): PlayerLookupFormErrors => {
    const newErrors: PlayerLookupFormErrors = {};

    if (!formData.searchValue?.trim()) {
      newErrors.searchValue = `${formData.searchType} is required`;
      return newErrors;
    }

    const value = formData.searchValue.trim();

    switch (formData.searchType) {
      case 'mobile':
        const mobileRegex = /^[6-9]\d{9}$/;
        if (!mobileRegex.test(value)) {
          newErrors.searchValue = 'Please enter a valid 10-digit mobile number';
        }
        break;

      case 'name':
        if (value.length < 2) {
          newErrors.searchValue = 'Name must be at least 2 characters long';
        }
        break;
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await onSubmit(formData);
      if (!success) {
        // Error handling is done in the hook
        setErrors({ searchValue: 'Search failed. Please try again.' });
      }
    } catch (error) {
      setErrors({ searchValue: 'Search failed. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setFormData({ searchType: formData.searchType, searchValue: '' });
    setErrors({});
  };

  const currentSearchType = getCurrentSearchType();
  const IconComponent = currentSearchType.icon;
  const isFormDisabled = isLoading || isSubmitting;

  return (
    <div className={`w-full max-w-lg mx-auto ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Search Type Selection */}
        {searchTypeOptions.length > 1 && (
          <div className="space-y-3">
            <Label className="text-sm font-bold uppercase tracking-wider ml-1" style={{ color: '#1a1a1a' }}>
              Search By
            </Label>
            <div className="flex gap-4">
              {searchTypeOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = formData.searchType === option.value;
                return (
                  <div
                    key={option.value}
                    onClick={() => {
                      setFormData(prev => ({ ...prev, searchType: option.value as 'mobile' | 'name', searchValue: '' }));
                      setErrors({});
                    }}
                    className={`flex-1 cursor-pointer flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 ${isSelected
                      ? 'border-sport-orange bg-green-50 text-sport-orange'
                      : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                      }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-sport-orange' : 'text-gray-400'}`} />
                    <span className={`font-medium ${isSelected ? 'font-bold' : ''}`}>{option.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Search Input */}
        <div className="space-y-3">
          <Label htmlFor="search-value" className="text-sm font-bold uppercase tracking-wider ml-1" style={{ color: '#1a1a1a' }}>
            {currentSearchType.label}
          </Label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <IconComponent className={`w-5 h-5 transition-colors duration-200 ${errors.searchValue ? 'text-red-400' : 'text-gray-400 group-focus-within:text-sport-orange'}`} />
            </div>
            <Input
              id="search-value"
              type="text"
              value={formData.searchValue}
              onChange={(e) => handleInputChange('searchValue', e.target.value)}
              placeholder={currentSearchType.placeholder}
              disabled={isFormDisabled}
              style={{ paddingLeft: '3.5rem', color: '#000000' }}
              className={`pl-24 pr-12 h-14 bg-white border-2 rounded-xl transition-all duration-200 text-lg font-bold placeholder:text-gray-400
                ${errors.searchValue
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50'
                  : 'border-gray-300 focus:border-sport-orange focus:ring-4 focus:ring-sport-orange/10 hover:border-gray-400'
                }`}
            />
            {formData.searchValue && (
              <button
                type="button"
                onClick={handleClear}
                disabled={isFormDisabled}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 disabled:opacity-50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          {errors.searchValue && (
            <p className="text-sm text-red-600 mt-2 font-medium flex items-center animate-in slide-in-from-top-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 mr-2"></span>
              {errors.searchValue}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="space-y-4">
          <Button
            type="submit"
            disabled={isFormDisabled || !formData.searchValue.trim()}
            className="w-full h-14 bg-linear-to-r from-sport-orange to-green-600 hover:from-green-500 hover:to-green-700 text-black font-bold text-lg rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-5 h-5 mr-2" />
                Search Player
              </>
            )}
          </Button>

          {isLoading && !isSubmitting && (
            <div className="flex items-center justify-center py-2 animate-in fade-in">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-sport-orange"></div>
              <span className="ml-2 text-sm text-gray-600 font-medium">Loading player data...</span>
            </div>
          )}
        </div>

        {/* Help Text */}
        <div className="text-center">
          <p className="text-sm bg-blue-50/50 py-2 px-4 rounded-lg inline-block border border-blue-100 font-bold" style={{ color: '#1e3a8a' }}>
            Enter the 10-digit mobile number used during registration
          </p>
        </div>
      </form>
    </div>
  );
};

export default PlayerSearchForm;