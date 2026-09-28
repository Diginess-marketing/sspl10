import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { playerExportService } from '@/utils/playerExportService';
import { supabase } from '@/integrations/supabase/client';
import { mapTrialRowToPlayerResult } from '@/lib/trialResults';
import type {
  PlayerResult,
  PlayerSearchCriteria,
  PlayerLookupFormData,
  PlayerLookupFormErrors,
  PlayerLookupState,
  PlayerExportOptions,
  PlayerExportResult,
} from '@/types/playerData';

export const usePlayerResultLookup = () => {
  const [state, setState] = useState<PlayerLookupState>({
    isLoading: false,
    error: null,
    results: [],
    searchPerformed: false,
    searchCriteria: {},
    totalCount: 0,
  });

  const [formData, setFormData] = useState<PlayerLookupFormData>({
    searchType: 'mobile',
    searchValue: '',
  });

  const [exportState, setExportState] = useState<{
    isExporting: boolean;
    lastExportResult: PlayerExportResult | null;
  }>({
    isExporting: false,
    lastExportResult: null,
  });

  const { toast } = useToast();

  // Search players based on form data
  const searchPlayers = useCallback(async (criteria?: PlayerSearchCriteria) => {
    const searchCriteria = criteria || {
      query: formData.searchValue.trim(),
      [formData.searchType]: formData.searchValue.trim(),
    };

    if (!searchCriteria.query) {
      setState(prev => ({
        ...prev,
        error: 'Please enter a search value',
        searchPerformed: true,
        searchCriteria,
      }));
      return;
    }

    try {
      setState(prev => ({
        ...prev,
        isLoading: true,
        error: null,
        searchPerformed: true,
        searchCriteria,
      }));

      let query = (supabase as any).from('trial_view').select('*');

      if (searchCriteria.mobile) {
        const cleanMobile = searchCriteria.mobile.trim().replace(/\D/g, '').slice(-10);
        // Sometimes phone is stored differently, so we use ilike on mobile
        query = query.ilike('mobile', `%${cleanMobile}%`);
      } else if (searchCriteria.name) {
        query = query.ilike('name', `%${searchCriteria.name}%`);
      } else if (searchCriteria.query) {
        // Try mobile first, if digits
        const isDigits = /^\d+$/.test(searchCriteria.query);
        if (isDigits) {
           query = query.ilike('mobile', `%${searchCriteria.query}%`);
        } else {
           query = query.ilike('name', `%${searchCriteria.query}%`);
        }
      }

      const { data, error } = await query;

      if (error) throw error;

      const finalResults = (data || []).map(mapTrialRowToPlayerResult);

      setState(prev => ({
        ...prev,
        isLoading: false,
        results: finalResults,
        totalCount: finalResults.length,
        error: finalResults.length === 0 ? 'No players found matching your search criteria' : null,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Search failed';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  }, [formData, toast]);

  // Clear search results
  const clearResults = useCallback(() => {
    setState(prev => ({
      ...prev,
      results: [],
      error: null,
      searchPerformed: false,
      searchCriteria: {},
      totalCount: 0,
    }));
    
    setFormData(prev => ({
      ...prev,
      searchValue: '',
    }));
  }, []);

  // Form validation
  const validateForm = useCallback((data: PlayerLookupFormData): PlayerLookupFormErrors => {
    const errors: PlayerLookupFormErrors = {};

    if (!data.searchValue?.trim()) {
      errors.searchValue = `${data.searchType} is required`;
      return errors;
    }

    const value = data.searchValue.trim();

    switch (data.searchType) {
      case 'mobile':
        const mobileRegex = /^[6-9]\d{9}$/;
        if (!mobileRegex.test(value)) {
          errors.searchValue = 'Please enter a valid 10-digit mobile number';
        }
        break;

      case 'name':
        if (value.length < 2) {
          errors.searchValue = 'Name must be at least 2 characters long';
        }
        break;
    }

    return errors;
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(async (data: PlayerLookupFormData) => {
    const errors = validateForm(data);

    if (Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0] as string;
      setState(prev => ({ ...prev, error: firstError }));
      return false;
    }

    // Update form data and search
    setFormData(data);
    await searchPlayers({
      query: data.searchValue.trim(),
      [data.searchType]: data.searchValue.trim(),
    });

    return true;
  }, [validateForm, searchPlayers]);

  // Export results
  const exportResults = useCallback(async (
    format: 'csv' | 'json' | 'pdf',
    includeFields?: (keyof PlayerResult)[],
  ) => {
    if (state.results.length === 0) {
      return;
    }

    try {
      setExportState(prev => ({ ...prev, isExporting: true }));

      const exportOptions: PlayerExportOptions = {
        format,
        includeFields: includeFields || ['name', 'mobile', 'state', 'proficiency', 'status'],
        filterCriteria: state.searchCriteria,
      };

      const result = await playerExportService.exportPlayerData(state.results, exportOptions);

      setExportState(prev => ({
        ...prev,
        isExporting: false,
        lastExportResult: result,
      }));

      if (!result.success) {
        throw new Error(result.error);
      }
    } catch (error) {
      setExportState(prev => ({ ...prev, isExporting: false }));
    }
  }, [state.results, state.searchCriteria]);

  // Get player by mobile
  const getPlayerByMobile = useCallback(async (mobile: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const cleanMobile = mobile.trim().replace(/\D/g, '').slice(-10);
      const { data, error } = await (supabase as any)
        .from('trial_view')
        .select('*')
        .ilike('mobile', `%${cleanMobile}%`)
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      let player: PlayerResult | null = null;
      if (data) {
        player = mapTrialRowToPlayerResult(data);
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        results: player ? [player] : [],
        totalCount: player ? 1 : 0,
        searchPerformed: true,
        searchCriteria: { mobile },
        error: player ? null : 'Player not found',
      }));

      return player;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Lookup failed';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return null;
    }
  }, []);

  // Reset to initial state
  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      results: [],
      searchPerformed: false,
      searchCriteria: {},
      totalCount: 0,
    });

    setFormData({
      searchType: 'mobile',
      searchValue: '',
    });

    setExportState({
      isExporting: false,
      lastExportResult: null,
    });
  }, []);

  return {
    // State
    ...state,
    formData,
    exportState,

    // Actions
    searchPlayers,
    clearResults,
    handleSubmit,
    exportResults,
    getPlayerByMobile,
    reset,
    validateForm,

    // Utilities
    hasResults: state.results.length > 0,
    totalPlayerCount: 0, // Not querying total players to save DB load
    isDataReady: !state.isLoading && !state.error,
  };
};
