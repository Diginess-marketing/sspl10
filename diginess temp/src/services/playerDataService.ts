import type {
  PlayerData,
  PlayerResult,
  PlayerSearchCriteria,
  PlayerSearchResult,
  PlayerValidationResult,
} from '@/types/playerData';
import { LEVEL_2_DATA } from '@/data/level2Data';
import { LEVEL_3_DATA } from '@/data/level3Data';
import { LEVEL_4_DATA } from '@/data/level4Data';
import { LEVEL_5_DATA } from '@/data/level5Data';

class PlayerDataService {
  private playersData: PlayerResult[] = [];
  private isDataLoaded = false;
  private cacheKey = 'sspl_players_data_v21'; // Incremented cache version for synchronized data
  private cacheExpiry = 5 * 60 * 1000; // 5 minutes

  /**
   * Load player data from JSON file
   */
  async loadPlayerData(): Promise<void> {
    try {
      // Check cache first
      const cachedData = this.getCachedData();
      if (cachedData && !this.isDataLoaded) { // Fix: Allow re-loading if isDataLoaded is false (refresh)
        if (!this.isDataExpired(cachedData.timestamp)) {
          console.log('📦 Using cached player data:', cachedData.data.length, 'players');
          this.playersData = cachedData.data;
          this.isDataLoaded = true;
          return;
        }
      }

      console.log('🔄 Cache expired or missing, loading fresh data...');

      // Load fresh data - encode URL to handle spaces and add cache-busting timestamp
      const timestamp = Date.now();
      const response = await fetch(`/Players_Data.json?t=${timestamp}`);
      console.log('📡 Fetching from:', `/Players_Data.json?t=${timestamp}`);

      if (!response.ok) {
        throw new Error(`Failed to load player data: ${response.status} ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        const text = await response.text();
        console.error('🚨 Received HTML instead of JSON. Preview:', text.substring(0, 200));
        throw new Error('Received HTML response for JSON request (likely 404 fallback). Check if Players_Data.json exists in public/ folder.');
      }

      const rawData: PlayerData[] = await response.json();
      console.log('📦 Raw data loaded:', rawData.length, 'players');

      // Process and normalize data
      const processedData = this.processPlayerData(rawData);

      // Cache the data
      this.cachePlayerData(processedData);

      this.playersData = processedData;
      this.isDataLoaded = true;

      console.log(`Loaded ${processedData.length} player records`);
    } catch (error) {
      console.error('Error loading player data:', error);
      throw new Error('Failed to load player data. Please try again.');
    }
  }

  /**
   * Get cached player data
   */
  private getCachedData(): { data: PlayerResult[]; timestamp: number } | null {
    try {
      const cached = localStorage.getItem(this.cacheKey);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Error reading cached data:', error);
      return null;
    }
  }

  /**
   * Cache player data
   */
  private cachePlayerData(data: PlayerResult[]): void {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(this.cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error caching player data:', error);
    }
  }

  /**
   * Check if cache is expired
   */
  private isDataExpired(timestamp: number): boolean {
    return Date.now() - timestamp > this.cacheExpiry;
  }

  /**
   * Process and normalize raw player data
   */
  private processPlayerData(rawData: PlayerData[]): PlayerResult[] {
    console.log('🔧 Processing raw data, first 5 entries:', rawData.slice(0, 5));

    const processed = rawData.map((player, index) => {
      // Check for Level 2 and Level 3 data
      // Match by Mobile Number (clean)
      const playerMobile = player.mobile.replace(/\D/g, '').slice(-10);

      const level2Match = LEVEL_2_DATA.find(l2 => l2.mobile === playerMobile);
      const level3Match = LEVEL_3_DATA.find(l3 => l3.mobile === playerMobile);
      const level4Match = LEVEL_4_DATA.find(l4 => l4.mobile === playerMobile);
      const level5Match = LEVEL_5_DATA.find(l5 => l5.mobile === playerMobile);

      let level2Data: PlayerResult['level2Data'] | undefined;
      let level3Data: PlayerResult['level3Data'] | undefined;
      let level4Data: PlayerResult['level4Data'] | undefined;
      let level5Data: PlayerResult['level5Data'] | undefined;
      let level: PlayerResult['level'] = 'Level 1';

      if (level2Match) {
        // Determine status based on remarks
        let status = 'NOT SELECTED';
        const remarksUpper = level2Match.remarks.toUpperCase();
        if (remarksUpper.includes('GOOD') || remarksUpper === 'SELECTED') status = 'SELECTED';
        else if (remarksUpper.includes('ABSENT')) status = 'ABSENT';

        level2Data = {
          status: status,
          score: level2Match.score,
          remarks: level2Match.remarks,
          listName: level2Match.listName
        };
        level = 'Both'; // Actually 'Level 2' or 'Both'
      }

      if (level3Match) {
        // Determine status based on remarks, similar to Level 2
        let status = 'NOT SELECTED';
        const remarksUpper = level3Match.remarks.toUpperCase();
        if (remarksUpper.includes('GOOD') || remarksUpper === 'SELECTED') status = 'SELECTED';
        else if (remarksUpper.includes('ABSENT')) status = 'ABSENT';

        level3Data = {
          status: status,
          score: level3Match.score,
          remarks: level3Match.remarks,
          listName: level3Match.listName
        };
        // If they have L3 data, they definitely have L1 and likely L2
        level = 'Both';
      }

      if (level4Match) {
        let status = 'NOT SELECTED';
        const remarksUpper = level4Match.remarks.toUpperCase();
        if (remarksUpper.includes('GOOD') || remarksUpper === 'SELECTED') status = 'SELECTED';
        else if (remarksUpper.includes('ABSENT')) status = 'ABSENT';
        else if (remarksUpper.includes('BLANK')) status = 'BLANK';

        level4Data = {
          status: status,
          score: level4Match.score,
          remarks: level4Match.remarks,
          listName: level4Match.listName
        };
        level = 'Both';
      }

      if (level5Match) {
        let status = 'NOT_SELECTED';
        const remarksUpper = level5Match.remarks.toUpperCase();
        if (remarksUpper.includes('GOOD') || remarksUpper === 'SELECTED') status = 'SELECTED';
        else if (remarksUpper.includes('ABSENT')) status = 'ABSENT';
        else if (remarksUpper === 'BLANK') status = 'BLANK';

        level5Data = {
          status: status,
          score: level5Match.score,
          remarks: level5Match.remarks,
          listName: level5Match.listName
        };
        level = 'Both';
      }

      return {
        ...player,
        id: `player_${index + 1}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        level: level,
        level2Data: level2Data,
        level3Data: level3Data,
        level4Data: level4Data,
        level5Data: level5Data
      };
    });

    return processed;
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

    const startTime = performance.now();
    let filteredResults = [...this.playersData];

    // Apply filters based on search criteria
    if (criteria.query) {
      const query = criteria.query.toLowerCase().trim();
      filteredResults = filteredResults.filter(player =>
        player.name.toLowerCase().includes(query) ||
        player.mobile.includes(query)
      );
    }

    if (criteria.mobile) {
      const mobile = criteria.mobile.trim().replace(/\D/g, '').slice(-10);
      filteredResults = filteredResults.filter(player => {
        const playerMobile = player.mobile.replace(/\D/g, '').slice(-10);
        return playerMobile.includes(mobile);
      });
    }

    if (criteria.name) {
      const name = criteria.name.toLowerCase().trim();
      filteredResults = filteredResults.filter(player =>
        player.name.toLowerCase().includes(name)
      );
    }

    const searchTime = performance.now() - startTime;
    console.log(`Search completed in ${searchTime.toFixed(2)}ms, found ${filteredResults.length} results`);

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
    return this.playersData.find(player => player.mobile === mobile) || null;
  }

  /**
   * Get single player by name
   */
  async getPlayerByName(name: string): Promise<PlayerResult | null> {
    await this.ensureDataLoaded();
    const searchName = name.toLowerCase().trim();
    return this.playersData.find(player =>
      player.name.toLowerCase() === searchName
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
   * Clear cache
   */
  clearCache(): void {
    try {
      localStorage.removeItem(this.cacheKey);
      console.log('Player data cache cleared');
    } catch (error) {
      console.error('Error clearing cache:', error);
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
    console.log('🔄 Forcing data refresh...');
    this.clearCache();
    this.isDataLoaded = false;
    this.playersData = [];
    await this.loadPlayerData();
  }

  /**
   * Get raw players data for debugging
   */
  getRawData(): PlayerResult[] {
    return this.playersData;
  }
}

export const playerDataService = new PlayerDataService();