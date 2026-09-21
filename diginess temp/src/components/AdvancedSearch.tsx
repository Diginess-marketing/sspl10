import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, X, TrendingUp, Users, Trophy, MapPin, Filter } from 'lucide-react';

interface SearchResult {
  id: string;
  type: 'team' | 'player' | 'match' | 'venue';
  title: string;
  subtitle?: string;
  image?: string;
  metadata?: Record<string, any>;
}

interface AdvancedSearchProps {
  placeholder?: string;
  onSearch?: (query: string, filters: Record<string, any>) => void;
  onResultSelect?: (result: SearchResult) => void;
  className?: string;
}

const AdvancedSearch = ({
  placeholder = 'Search teams, players, matches...',
  onSearch,
  onResultSelect,
  className = '',
}: AdvancedSearchProps) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    location: 'all',
  });
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mock search data - in real app, this would come from API
  const mockSearchData: SearchResult[] = [
    {
      id: '1',
      type: 'team',
      title: 'Chennai Super Kings',
      subtitle: 'Chennai, Tamil Nadu',
      metadata: { players: 15, captain: 'MS Dhoni' },
    },
    {
      id: '2',
      type: 'player',
      title: 'Virat Kohli',
      subtitle: 'Bangalore Blasters',
      metadata: { role: 'Batsman', runs: 892 },
    },
    {
      id: '3',
      type: 'match',
      title: 'CSK vs RR',
      subtitle: 'Chennai • March 15, 2025',
      metadata: { venue: 'Chepauk', status: 'upcoming' },
    },
    {
      id: '4',
      type: 'venue',
      title: 'M. Chinnaswamy Stadium',
      subtitle: 'Bangalore, Karnataka',
      metadata: { capacity: '40,000', matches: 24 },
    },
  ];

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Save recent searches to localStorage
  const saveRecentSearch = (searchQuery: string) => {
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  // Handle search
  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    setIsOpen(true);

    // Simulate API call
    setTimeout(() => {
      const filteredResults = mockSearchData.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subtitle?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setResults(filteredResults);
      setIsLoading(false);

      if (onSearch) {
        onSearch(searchQuery, filters);
      }
    }, 300);
  };

  // Handle input change with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query) {
        handleSearch(query);
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, filters]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResultClick = (result: SearchResult) => {
    setQuery(result.title);
    setIsOpen(false);
    saveRecentSearch(result.title);

    if (onResultSelect) {
      onResultSelect(result);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'team': return <Trophy className="w-4 h-4" />;
      case 'player': return <Users className="w-4 h-4" />;
      case 'match': return <TrendingUp className="w-4 h-4" />;
      case 'venue': return <MapPin className="w-4 h-4" />;
      default: return <Search className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'team': return 'bg-cricket-blue/20 text-cricket-blue';
      case 'player': return 'bg-cricket-green/20 text-cricket-green';
      case 'match': return 'bg-cricket-orange/20 text-cricket-orange';
      case 'venue': return 'bg-cricket-purple/20 text-cricket-purple';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div ref={searchRef} className={`relative w-full max-w-md ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cricket-blue" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query && setIsOpen(true)}
          className="pl-10 pr-10 py-3 bg-white/90 backdrop-blur-sm border-cricket-blue/30 focus:border-cricket-blue text-cricket-blue placeholder:text-cricket-blue/60"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cricket-blue/60 hover:text-cricket-blue"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-cricket-blue/20 z-50 max-h-96 overflow-y-auto">

          {/* Filters */}
          <div className="p-3 border-b border-gray-100">
            <div className="flex items-center gap-2 text-sm text-cricket-blue mb-2">
              <Filter className="w-4 h-4" />
              <span className="font-medium">Filters</span>
            </div>
            <div className="flex gap-2">
              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                className="text-xs px-2 py-1 border border-cricket-blue/30 rounded bg-white text-cricket-blue"
              >
                <option value="all">All Types</option>
                <option value="team">Teams</option>
                <option value="player">Players</option>
                <option value="match">Matches</option>
                <option value="venue">Venues</option>
              </select>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="p-4 text-center">
              <div className="animate-spin w-6 h-6 border-2 border-cricket-blue border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-sm text-cricket-blue">Searching...</p>
            </div>
          )}

          {/* Search Results */}
          {!isLoading && results.length > 0 && (
            <div className="py-2">
              {results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  className="w-full px-4 py-3 hover:bg-cricket-light-blue/10 transition-colors text-left flex items-center gap-3"
                >
                  <div className={`p-2 rounded-lg ${getTypeColor(result.type)}`}>
                    {getTypeIcon(result.type)}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-cricket-blue">{result.title}</div>
                    {result.subtitle && (
                      <div className="text-sm text-cricket-charcoal">{result.subtitle}</div>
                    )}
                    <div className="flex gap-2 mt-1">
                      <Badge className={`text-xs ${getTypeColor(result.type)}`}>
                        {result.type}
                      </Badge>
                      {result.metadata && Object.entries(result.metadata).slice(0, 2).map(([key, value]) => (
                        <span key={key} className="text-xs text-cricket-charcoal">
                          {key}: {value}
                        </span>
                      ))}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {!isLoading && query && results.length === 0 && (
            <div className="p-4 text-center">
              <Search className="w-8 h-8 text-cricket-blue/40 mx-auto mb-2" />
              <p className="text-sm text-cricket-charcoal">No results found for "{query}"</p>
              <p className="text-xs text-cricket-blue/60 mt-1">Try adjusting your search terms</p>
            </div>
          )}

          {/* Recent Searches */}
          {!query && recentSearches.length > 0 && (
            <div className="py-2">
              <div className="px-4 py-2 text-sm font-medium text-cricket-blue border-b border-gray-100">
                Recent Searches
              </div>
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => setQuery(search)}
                  className="w-full px-4 py-2 hover:bg-cricket-light-blue/10 transition-colors text-left text-sm text-cricket-charcoal"
                >
                  {search}
                </button>
              ))}
            </div>
          )}

          {/* Popular Searches */}
          {!query && recentSearches.length === 0 && (
            <div className="py-2">
              <div className="px-4 py-2 text-sm font-medium text-cricket-blue border-b border-gray-100">
                Popular Searches
              </div>
              {['Virat Kohli', 'Chennai Super Kings', 'M. Chinnaswamy Stadium', 'T20 World Cup'].map((search, index) => (
                <button
                  key={index}
                  onClick={() => setQuery(search)}
                  className="w-full px-4 py-2 hover:bg-cricket-light-blue/10 transition-colors text-left text-sm text-cricket-charcoal"
                >
                  {search}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;