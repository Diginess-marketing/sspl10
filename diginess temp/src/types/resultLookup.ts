export interface TrialResult {
  id: string;
  name: string;
  mobile: string;
  points: number;
  selectionStatus: 'Selected' | 'Rejected' | 'Blank';
  created_at: string;
  updated_at: string;
}

export interface TrialLookupRequest {
  mobile: string;
}

export interface TrialLookupResponse {
  success: boolean;
  result: TrialResult;
  error?: string;
  message?: string;
}

export interface TrialLookupState {
  isLoading: boolean;
  error: string | null;
  result: TrialResult | null;
  hasSearched: boolean;
}

// Form validation types
export interface TrialLookupFormData {
  mobile: string;
}

export interface TrialLookupFormErrors {
  mobile?: string;
}

// API Response types
export interface TrialLookupApiResponse {
  success: boolean;
  data?: TrialLookupResponse;
  error?: string;
  message?: string;
  timestamp: string;
}