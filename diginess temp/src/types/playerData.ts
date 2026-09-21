// Player Data Types for Cricket Trial Results
export interface PlayerData {
  mobile: string;
  state: string;
  city?: string;
  name: string;
  proficiency: string;
  status: string;
  marks?: number;
  timing?: string;
  remarks?: string;
}

export interface PlayerResult extends PlayerData {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  level?: 'Level 1' | 'Level 2' | 'Both';
  level2Data?: {
    status: string;
    score: string;
    remarks: string;
    listName: string;
  };
  level3Data?: {
    status: string;
    score: string;
    remarks: string;
    listName: string;
  };
  level4Data?: {
    status: string;
    score: string;
    remarks: string;
    listName: string;
  };
  level5Data?: {
    status: string;
    score: string;
    remarks: string;
    listName: string;
  };
  isCompletelyAbsent?: boolean;
}

// Search and Filter Types
export interface PlayerSearchCriteria {
  query?: string; // For general search
  mobile?: string;
  name?: string;
}

export interface PlayerSearchResult {
  totalCount: number;
  results: PlayerResult[];
  searchCriteria: PlayerSearchCriteria;
}

// Form Data Types
export interface PlayerLookupFormData {
  searchType: 'mobile' | 'name';
  searchValue: string;
}

export interface PlayerLookupFormErrors {
  searchValue?: string;
}

// State Management Types
export interface PlayerLookupState {
  isLoading: boolean;
  error: string | null;
  results: PlayerResult[];
  searchPerformed: boolean;
  searchCriteria: PlayerSearchCriteria;
  totalCount: number;
}

// API Response Types
export interface PlayerLookupApiResponse {
  success: boolean;
  data?: {
    results: PlayerResult[];
    totalCount: number;
    searchCriteria: PlayerSearchCriteria;
  };
  error?: string;
  message?: string;
  timestamp: string;
}

// Export Types
export interface PlayerExportOptions {
  format: 'csv' | 'json' | 'pdf';
  includeFields: (keyof PlayerResult)[];
  filterCriteria?: PlayerSearchCriteria;
}

export interface PlayerExportResult {
  success: boolean;
  downloadUrl?: string;
  filename?: string;
  recordCount: number;
  error?: string;
}

// Validation Types
export interface PlayerValidationResult {
  isValid: boolean;
  errors: string[];
  normalizedData?: Partial<PlayerData>;
}

// Performance Metrics
export interface PlayerLookupMetrics {
  searchTimeMs: number;
  resultsCount: number;
  searchType: string;
  timestamp: string;
}