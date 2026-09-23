import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, ChevronDown, MapPin, Calendar, Users, Trophy } from 'lucide-react';
import { EnhancedInput } from './enhanced-components';
import { Badge } from './badge';
import { Button } from './button';

interface SearchResult {
  id: string;
  title: string;
  type: 'team' | 'player' | 'match' | 'news';
  description?: string;
  image?: string;
  metadata?: {
    location?: string;
    date?: string;
    players?: number;
    matches?: number;
  };
}

interface SearchFilters {
  type?: string;
  location?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  category?: string;
}

interface EnhancedSearchProps {
  placeholder?: string;
  onSearch?: (query: string, filters: SearchFilters) => void;
  onResultSelect?: (result: SearchResult) => void;
  searchResults?: SearchResult[];
  isLoading?: boolean;
  showFilters?: boolean;
  className?: string;
}

const EnhancedSearch: React.FC<EnhancedSearchProps> = ({
  placeholder = 'Search teams, players, matches...',
  onSearch,
  onResultSelect,
  searchResults = [],
  isLoading = false,
  showFilters = true,
  className = '',
}) => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showResults, setShowResults] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  // Mock search results for demonstration
  const mockResults: SearchResult[] = [
    {
      id: '1',
      title: 'Tamil Nadu Cricket Team',
      type: 'team',
      description: 'Southern Street Premier League champions 2024',
      metadata: { location: 'Chennai', players: 14, matches: 8 },
    },
    {
      id: '2',
      title: 'Karnataka Cricket Team',
      type: 'team',
      description: 'Defending champions with strong batting lineup',
      metadata: { location: 'Bangalore', players: 15, matches: 7 },
    },
    {
      id: '3',
      title: 'Final Match - TN vs KA',
      type: 'match',
      description: 'Championship final at Sharjah Cricket Stadium',
      metadata: { location: 'Sharjah', date: '2025-01-15' },
    },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilterDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    if (searchQuery.length > 2) {
      setShowResults(true);
      onSearch?.(searchQuery, filters);

      // Add to recent searches
      if (searchQuery && !recentSearches.includes(searchQuery)) {
        setRecentSearches(prev => [searchQuery, ...prev.slice(0, 4)]);
      }
    } else {
      setShowResults(false);
    }
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'team': return <Users className="w-4 h-4" />;
      case 'player': return <Trophy className="w-4 h-4" />;
      case 'match': return <Calendar className="w-4 h-4" />;
      default: return <Search className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'team': return 'bg-gradient-accent';
      case 'player': return 'bg-gradient-sunset';
      case 'match': return 'bg-gradient-ocean';
      default: return 'bg-gradient-primary';
    }
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <EnhancedInput
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
            animated={true}
            className="pr-10"
          />

          {/* Loading indicator */}
          {isLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cricket-blue"></div>
            </div>
          )}
        </div>

        {showFilters && (
          <div className="relative" ref={filterRef}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className={`relative ${activeFiltersCount > 0 ? 'border-cricket-blue bg-cricket-blue/10' : ''}`}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge className="ml-2 bg-cricket-blue text-white text-xs px-1.5 py-0.5">
                  {activeFiltersCount}
                </Badge>
              )}
              <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilterDropdown ? 'rotate-180' : ''}`} />
            </Button>

            {/* Filter Dropdown */}
            {showFilterDropdown && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-card border border-cricket-light-blue/20 z-50 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-cricket-blue">Search Filters</h3>
                  {activeFiltersCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-cricket-blue hover:text-cricket-dark-blue"
                    >
                      Clear All
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Type Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <select
                      value={filters.type || ''}
                      onChange={(e) => handleFilterChange('type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cricket-blue focus:border-transparent"
                    >
                      <option value="">All Types</option>
                      <option value="team">Teams</option>
                      <option value="player">Players</option>
                      <option value="match">Matches</option>
                      <option value="news">News</option>
                    </select>
                  </div>

                  {/* Location Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Enter location"
                        value={filters.location || ''}
                        onChange={(e) => handleFilterChange('location', e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cricket-blue focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Date Range Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        value={filters.dateRange?.start || ''}
                        onChange={(e) => handleFilterChange('dateRange', {
                          ...filters.dateRange,
                          start: e.target.value,
                        })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cricket-blue focus:border-transparent text-sm"
                      />
                      <input
                        type="date"
                        value={filters.dateRange?.end || ''}
                        onChange={(e) => handleFilterChange('dateRange', {
                          ...filters.dateRange,
                          end: e.target.value,
                        })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cricket-blue focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && (query.length > 2) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-card border border-cricket-light-blue/20 z-40 max-h-96 overflow-y-auto">
          {/* Recent Searches */}
          {query.length === 0 && recentSearches.length > 0 && (
            <div className="p-4 border-b border-gray-100">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Searches</h4>
              <div className="space-y-1">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(search)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <Search className="w-4 h-4 inline mr-2" />
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Results */}
          <div className="p-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cricket-blue"></div>
                <span className="ml-2 text-gray-600">Searching...</span>
              </div>
            ) : (searchResults.length > 0 ? searchResults : mockResults).length > 0 ? (
              <div className="space-y-1">
                {(searchResults.length > 0 ? searchResults : mockResults).map((result) => (
                  <button
                    key={result.id}
                    onClick={() => {
                      onResultSelect?.(result);
                      setShowResults(false);
                      setQuery(result.title);
                    }}
                    className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors group"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${getTypeColor(result.type)} text-white shrink-0`}>
                        {getTypeIcon(result.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 group-hover:text-cricket-blue transition-colors">
                          {result.title}
                        </h4>
                        {result.description && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {result.description}
                          </p>
                        )}
                        {result.metadata && (
                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                            {result.metadata.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {result.metadata.location}
                              </span>
                            )}
                            {result.metadata.date && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {result.metadata.date}
                              </span>
                            )}
                            {result.metadata.players && (
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {result.metadata.players} players
                              </span>
                            )}
                            {result.metadata.matches && (
                              <span className="flex items-center gap-1">
                                <Trophy className="w-3 h-3" />
                                {result.metadata.matches} matches
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Search className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No results found for "{query}"</p>
                <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedSearch;