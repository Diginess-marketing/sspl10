import type {
  PlayerData,
  PlayerResult,
  PlayerSearchCriteria,
  PlayerSearchResult,
  PlayerValidationResult,
} from '@/types/playerData';
import { fetchAllTrialResults } from '@/lib/trialResults';

// Cache key used by the old local-file loader; removed so browsers drop the stale copy.
const LEGACY_CACHE_KEY = 'sspl_players_data_v21';

const cleanMobile = (mobile: string) => mobile.replace(/\D/g, '').slice(-10);

class PlayerDataService {
  private playersData: PlayerResult[] = [];
  private isDataLoaded = false;

  /**
   * Load every registered trial candidate from the database
   */
  async loadPlayerData(): Promise<void> {
    try {
      this.clearCache();
      this.playersData = await fetchAllTrialResults();
      this.isDataLoaded = true;
    } catch (error) {
      console.error('Error loading player data:', error);
      throw new Error('Failed to load player data. Please try again.');
    }
  }

  /**
   * Ensure data is loaded
   */
  private async ensureDataLoaded(): Promise<void> {
    if (!this.isDataLoaded) {
      await this.loadPlayerData();
    }
  }

  /**
   * Search players based on criteria
   */
  async searchPlayers(criteria: PlayerSearchCriteria): Promise<PlayerSearchResult> {
    await this.ensureDataLoaded();

    let filteredResults = [...this.playersData];

    if (criteria.query) {
      const query = criteria.query.toLowerCase().trim();
      filteredResults = filteredResults.filter(player =>
        player.name.toLowerCase().includes(query) ||
        player.mobile.includes(query),
      );
    }

    if (criteria.mobile) {
      const mobile = cleanMobile(criteria.mobile.trim());
      filteredResults = filteredResults.filter(player => cleanMobile(player.mobile).includes(mobile));
    }

    if (criteria.name) {
      const name = criteria.name.toLowerCase().trim();
      filteredResults = filteredResults.filter(player =>
        player.name.toLowerCase().includes(name),
      );
    }

    return {
      totalCount: filteredResults.length,
      results: filteredResults,
      searchCriteria: criteria,
    };
  }

  /**
   * Get single player by mobile number
   */
  async getPlayerByMobile(mobile: string): Promise<PlayerResult | null> {
    await this.ensureDataLoaded();
    const target = cleanMobile(mobile);
    return this.playersData.find(player => cleanMobile(player.mobile) === target) || null;
  }

  /**
   * Get single player by name
   */
  async getPlayerByName(name: string): Promise<PlayerResult | null> {
    await this.ensureDataLoaded();
    const searchName = name.toLowerCase().trim();
    return this.playersData.find(player =>
      player.name.toLowerCase() === searchName,
    ) || null;
  }

  /**
   * Validate player data
   */
  validatePlayerData(data: Partial<PlayerData>): PlayerValidationResult {
    const errors: string[] = [];

    if (data.mobile) {
      const mobileRegex = /^[6-9]\d{9}$/;
      if (!mobileRegex.test(data.mobile.trim())) {
        errors.push('Invalid mobile number format');
      }
    }

    if (data.name && data.name.trim().length < 2) {
      errors.push('Name must be at least 2 characters long');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Remove the legacy browser cache of player data
   */
  clearCache(): void {
    try {
      localStorage.removeItem(LEGACY_CACHE_KEY);
    } catch {
      // Storage can be unavailable (private mode); nothing to clear then
    }
  }

  /**
   * Get total player count
   */
  getTotalPlayerCount(): number {
    return this.playersData.length;
  }

  /**
   * Refresh player data
   */
  async refreshData(): Promise<void> {
    this.isDataLoaded = false;
    this.playersData = [];
    await this.loadPlayerData();
  }

  /**
   * Get loaded players
   */
  getRawData(): PlayerResult[] {
    return this.playersData;
  }
}

export const playerDataService = new PlayerDataService();
