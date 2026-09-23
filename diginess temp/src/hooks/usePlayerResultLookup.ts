import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { playerExportService } from '@/utils/playerExportService';
import { supabase } from '@/integrations/supabase/client';
import type {
  PlayerResult,
  PlayerSearchCriteria,
  PlayerLookupFormData,
  PlayerLookupFormErrors,
  PlayerLookupState,
  PlayerExportOptions,
  PlayerExportResult,
} from '@/types/playerData';

import level45Data from '@/data/level45Data.json';

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

  // Helper to map DB row to PlayerResult
  const mapDbRowToPlayerResult = (row: any): PlayerResult => {
    const mobileNumber = String(row.mobile || row.phone || '').trim().replace(/\D/g, '').slice(-10);
    const l45Info = (level45Data as any)[mobileNumber] || { l4: 'PENDING', l5: 'PENDING' };

    const l1 = row.l1_result?.toUpperCase() || 'PENDING';
    const l2 = row.l2_result?.toUpperCase() || 'PENDING';
    const l3 = row.l3_result?.toUpperCase() || 'PENDING';

    const l1_att = row.l1_attendance?.toUpperCase();
    const l2_att = row.l2_attendance?.toUpperCase();
    const l3_att = row.l3_attendance?.toUpperCase();

    const isCompletelyAbsent = 
      l1_att === 'ABSENT' && 
      (l2_att === 'ABSENT' || !l2_att) && 
      (l3_att === 'ABSENT' || !l3_att);

    let l1Status = l1;
    if (l1Status === 'REJECTED') l1Status = 'NOT_SELECTED';
    else if (l1Status === 'PENDING' && l1_att === 'ABSENT') l1Status = 'ABSENT';

    let l2Status = l2;
    if (l2Status === 'REJECTED') l2Status = 'NOT_SELECTED';
    else if (l2Status === 'PENDING' && l2_att === 'ABSENT') l2Status = 'ABSENT';

    let l3Status = l3;
    if (l3Status === 'REJECTED') l3Status = 'NOT_SELECTED';
    else if (l3Status === 'PENDING' && l3_att === 'ABSENT') l3Status = 'ABSENT';

    let l4Status = l45Info.l4 ? l45Info.l4.toUpperCase() : 'PENDING';
    if (l4Status === 'REJECTED' || l4Status === 'NOT SELECTED') l4Status = 'NOT_SELECTED';

    let l5Status = l45Info.l5 ? l45Info.l5.toUpperCase() : 'PENDING';
    if (l5Status === 'REJECTED' || l5Status === 'NOT SELECTED') l5Status = 'NOT_SELECTED';

    // Cascading logic
    if (l1Status === 'ABSENT') {
      l2Status = 'ABSENT'; l3Status = 'ABSENT'; l4Status = 'ABSENT'; l5Status = 'ABSENT';
    } else if (l1Status === 'NOT_SELECTED') {
      l2Status = 'NOT_SELECTED'; l3Status = 'NOT_SELECTED'; l4Status = 'NOT_SELECTED'; l5Status = 'NOT_SELECTED';
    } else if (l1Status === 'PENDING') {
      l2Status = 'PENDING'; l3Status = 'PENDING';
    } else if (l1Status === 'SELECTED') {
      if (l2Status === 'ABSENT') {
        l3Status = 'ABSENT'; l4Status = 'ABSENT'; l5Status = 'ABSENT';
      } else if (l2Status === 'NOT_SELECTED') {
        l3Status = 'NOT_SELECTED'; l4Status = 'NOT_SELECTED'; l5Status = 'NOT_SELECTED';
      } else if (l2Status === 'PENDING') {
        l3Status = 'PENDING';
      } else if (l2Status === 'SELECTED') {
        if (l3Status === 'ABSENT') {
          l4Status = 'ABSENT'; l5Status = 'ABSENT';
        } else if (l3Status === 'NOT_SELECTED') {
          l4Status = 'NOT_SELECTED'; l5Status = 'NOT_SELECTED';
        } else if (l3Status === 'SELECTED') {
          if (l4Status === 'ABSENT') {
            l5Status = 'ABSENT';
          } else if (l4Status === 'NOT_SELECTED') {
            l5Status = 'NOT_SELECTED';
          }
        }
      }
    }

    return {
      id: row.candidate_id || row.mobile,
      mobile: row.mobile || row.phone || '',
      state: row.state || '',
      city: row.city || '',
      name: row.name || '',
      proficiency: row.proficiency || '',
      status: l1Status, // maps to level 1 status
      marks: row.l1_marks || 0,
      createdAt: row.created_at || new Date().toISOString(),
      updatedAt: row.updated_at || new Date().toISOString(),
      level: 'Both',
      level2Data: {
        status: l2Status,
        score: row.l2_marks ? String(row.l2_marks) : '',
        remarks: row.l2_remarks || '',
        listName: 'Level 2',
      },
      level3Data: {
        status: l3Status,
        score: row.l3_marks ? String(row.l3_marks) : '',
        remarks: row.l3_remarks || '',
        listName: 'Level 3',
      },
      level4Data: {
        status: l4Status,
        score: '',
        remarks: '',
        listName: 'Level 4',
      },
      level5Data: {
        status: l5Status,
        score: '',
        remarks: '',
        listName: 'Level 5',
      },
      isCompletelyAbsent,
    };
  };

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

      const finalResults = (data || []).map(mapDbRowToPlayerResult);

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
        player = mapDbRowToPlayerResult(data);
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