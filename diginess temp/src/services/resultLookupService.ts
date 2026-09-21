import type {
  TrialLookupRequest,
  TrialLookupResponse,
  TrialResult,
  TrialLookupApiResponse,
} from '@/types/resultLookup';
import { playerDataService } from './playerDataService';

class ResultLookupService {
  /**
   * Lookup trial result by mobile number using real player data
   */
  async lookupTrialResult(request: TrialLookupRequest): Promise<TrialLookupApiResponse> {
    try {
      // Validate request
      if (!request.mobile?.trim()) {
        return {
          success: false,
          error: 'Mobile number is required',
          timestamp: new Date().toISOString(),
        };
      }

      const mobile = request.mobile.trim();

      // Validate mobile number format
      const validation = this.validateMobileNumber(mobile);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', '),
          timestamp: new Date().toISOString(),
        };
      }

      // Load player data if not already loaded
      await playerDataService.loadPlayerData();

      // Search for player by mobile number
      const player = await playerDataService.getPlayerByMobile(mobile);

      if (player) {
        let finalStatus: 'Selected' | 'Rejected' | 'Blank' = this.getSelectionStatus(player.marks || 0);
        let finalPoints = (player.marks || 0) * 2;

        if (player.level5Data) {
          finalStatus = player.level5Data.status === 'SELECTED' ? 'Selected' : (player.level5Data.status === 'BLANK' || player.level5Data.status === 'ABSENT') ? 'Blank' : 'Rejected';
          if (player.level5Data.score && player.level5Data.score !== 'N/A') finalPoints = parseInt(player.level5Data.score) || finalPoints;
        } else if (player.level4Data) {
          finalStatus = player.level4Data.status === 'SELECTED' ? 'Selected' : (player.level4Data.status === 'BLANK' || player.level4Data.status === 'ABSENT') ? 'Blank' : 'Rejected';
          if (player.level4Data.score && player.level4Data.score !== 'N/A') finalPoints = parseInt(player.level4Data.score) || finalPoints;
        } else if (player.level3Data) {
          finalStatus = player.level3Data.status === 'SELECTED' ? 'Selected' : (player.level3Data.status === 'BLANK' || player.level3Data.status === 'ABSENT') ? 'Blank' : 'Rejected';
          if (player.level3Data.score && player.level3Data.score !== 'N/A') finalPoints = parseInt(player.level3Data.score) || finalPoints;
        } else if (player.level2Data) {
          finalStatus = player.level2Data.status === 'SELECTED' ? 'Selected' : (player.level2Data.status === 'BLANK' || player.level2Data.status === 'ABSENT') ? 'Blank' : 'Rejected';
          if (player.level2Data.score && player.level2Data.score !== 'N/A') finalPoints = parseInt(player.level2Data.score) || finalPoints;
        } else if (player.status) {
          finalStatus = (player.status.toUpperCase() === 'SELECTED' || player.status.toUpperCase() === 'GOOD') ? 'Selected' : (player.status.toUpperCase() === 'BLANK' || player.status.toUpperCase() === 'ABSENT') ? 'Blank' : 'Rejected';
        }

        // Convert PlayerResult to TrialResult format for compatibility
        const trialResult: TrialResult = {
          id: player.id,
          name: player.name,
          mobile: player.mobile,
          points: finalPoints,
          selectionStatus: finalStatus,
          created_at: player.createdAt || new Date().toISOString(),
          updated_at: player.updatedAt || new Date().toISOString(),
        };

        const response: TrialLookupResponse = {
          success: true,
          result: trialResult,
          message: 'Trial result found successfully',
        };

        return {
          success: true,
          data: response,
          timestamp: new Date().toISOString(),
        };
      } else {
        return {
          success: false,
          error: 'No trial result found for the given mobile number',
          timestamp: new Date().toISOString(),
        };
      }

    } catch (error) {
      console.error('Trial result lookup error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to lookup trial result',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Determine selection status based on marks
   */
  private getSelectionStatus(marks: number): 'Selected' | 'Rejected' {
    // Assuming 40+ marks (out of 50) means selection
    return marks >= 40 ? 'Selected' : 'Rejected';
  }

  /**
   * Validate mobile number format
   */
  validateMobileNumber(mobile: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!mobile?.trim()) {
      errors.push('Mobile number is required');
    } else {
      // Basic mobile number validation (10 digits)
      const mobileRegex = /^[6-9]\d{9}$/;
      if (!mobileRegex.test(mobile.trim())) {
        errors.push('Please enter a valid 10-digit mobile number');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export const resultLookupService = new ResultLookupService();