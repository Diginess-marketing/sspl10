import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { resultLookupService } from '@/services/resultLookupService';
import type {
  TrialLookupState,
  TrialLookupRequest,
  TrialLookupFormData,
  TrialLookupFormErrors,
  TrialResult,
} from '@/types/resultLookup';

export const useResultLookup = () => {
  const [state, setState] = useState<TrialLookupState>({
    isLoading: false,
    error: null,
    result: null,
    hasSearched: false,
  });

  const { toast } = useToast();

  // Lookup trial result
  const lookupTrialResult = useCallback(async (request: TrialLookupRequest) => {
    // Validate request
    const validation = resultLookupService.validateMobileNumber(request.mobile);
    if (!validation.isValid) {
      setState(prev => ({
        ...prev,
        error: validation.errors.join(', '),
        isLoading: false,
        hasSearched: true,
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      const response = await resultLookupService.lookupTrialResult(request);

      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: null,
          result: response.data!.result,
          hasSearched: true,
        }));

        // Show success toast
        toast({
          title: 'Trial Result Found',
          description: `Found result for ${response.data.result.name}`,
          variant: 'default',
        });
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: response.error || 'Failed to lookup trial result',
          result: null,
          hasSearched: true,
        }));

        toast({
          title: 'No Result Found',
          description: response.error || 'No trial result found for the given mobile number',
          variant: 'destructive',
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        result: null,
        hasSearched: true,
      }));

      toast({
        title: 'Lookup Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }, [toast]);

  // Clear results
  const clearResults = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      result: null,
      hasSearched: false,
    });
  }, []);

  // Form validation
  const validateForm = useCallback((formData: TrialLookupFormData): TrialLookupFormErrors => {
    const errors: TrialLookupFormErrors = {};

    if (!formData.mobile?.trim()) {
      errors.mobile = 'Mobile number is required';
    } else {
      const mobileRegex = /^[6-9]\d{9}$/;
      if (!mobileRegex.test(formData.mobile.trim())) {
        errors.mobile = 'Please enter a valid 10-digit mobile number';
      }
    }

    return errors;
  }, []);

  // Submit form
  const submitLookup = useCallback(async (formData: TrialLookupFormData) => {
    const errors = validateForm(formData);

    if (Object.keys(errors).length > 0) {
      // Show first error in toast
      const firstError = Object.values(errors)[0] as string;
      toast({
        title: 'Validation Error',
        description: firstError,
        variant: 'destructive',
      });
      return false;
    }

    const request: TrialLookupRequest = {
      mobile: formData.mobile.trim(),
    };

    await lookupTrialResult(request);
    return true;
  }, [validateForm, lookupTrialResult, toast]);

  return {
    // State
    ...state,

    // Actions
    lookupTrialResult,
    clearResults,
    submitLookup,
    validateForm,
  };
};