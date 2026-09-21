// SSPL Data Types
export interface SSPLTeam {
  id: string;
  name: string;
  city: string;
  logo?: string;
  founded_year?: number;
  home_ground?: string;
  captain?: string;
  coach?: string;
  owner?: string;
  website?: string;
  social_media?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

// Admin-managed FAQ system
export interface SSPLFAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// Admin-managed content categories
export interface SSPLContentCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Admin-managed chatbot responses
export interface SSPLChatbotResponse {
  id: string;
  trigger_keywords: string[];
  response_text: string;
  response_type: 'text' | 'list' | 'card';
  category: string;
  is_active: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

// Admin data management operations
export interface AdminDataOperation {
  id: string;
  operation_type: 'create' | 'update' | 'delete' | 'import';
  entity_type: 'team' | 'player' | 'match' | 'faq' | 'news';
  entity_id?: string;
  data: any;
  admin_id: string;
  status: 'pending' | 'completed' | 'failed';
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface SSPLPlayer {
  id: string;
  name: string;
  team_id: string;
  position: 'batsman' | 'bowler' | 'all-rounder' | 'wicket-keeper';
  jersey_number?: number;
  date_of_birth?: string;
  nationality?: string;
  batting_style?: 'right-handed' | 'left-handed';
  bowling_style?: string;
  debut_date?: string;
  stats: {
    matches: number;
    runs: number;
    wickets: number;
    centuries: number;
    fifties: number;
    highest_score: number;
    best_bowling: string;
    average: number;
    strike_rate: number;
  };
  is_captain?: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SSPLMatch {
  id: string;
  match_number: number;
  season: string;
  date: string;
  time: string;
  venue: string;
  team_a_id: string;
  team_b_id: string;
  team_a_score?: {
    runs: number;
    wickets: number;
    overs: number;
  };
  team_b_score?: {
    runs: number;
    wickets: number;
    overs: number;
  };
  winner_id?: string;
  result: 'upcoming' | 'live' | 'completed' | 'cancelled';
  toss_winner?: string;
  toss_decision?: 'bat' | 'bowl';
  man_of_the_match?: string;
  match_type: 'league' | 'playoff' | 'final';
  created_at: string;
  updated_at: string;
}

export interface SSPLStanding {
  id: string;
  team_id: string;
  season: string;
  matches_played: number;
  wins: number;
  losses: number;
  draws: number;
  points: number;
  net_run_rate: number;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface SSPLNews {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  published_date: string;
  category: 'match' | 'player' | 'team' | 'league' | 'general';
  tags: string[];
  featured_image?: string;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface SSPLTournament {
  id: string;
  name: string;
  season: string;
  start_date: string;
  end_date: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  total_teams: number;
  total_matches: number;
  winner?: string;
  runner_up?: string;
  venue: string;
  prize_money: number;
  created_at: string;
  updated_at: string;
}

// Chatbot Types
export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type: 'text' | 'data' | 'error';
  metadata?: {
    query_type?: string;
    data_source?: string;
    confidence?: number;
  };
}

export interface ChatbotQuery {
  text: string;
  intent: string;
  entities: Record<string, any>;
  confidence: number;
}

export interface ChatbotResponse {
  text: string;
  type: 'text' | 'data' | 'error';
  data?: any;
  suggestions?: string[];
  follow_up_questions?: string[];
}

// API Response Types
export interface SSPLApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface ScrapingResult {
  success: boolean;
  data?: any;
  errors: string[];
  rate_limited: boolean;
  retry_after?: number;
}

// Service Types
export interface DataFetchOptions {
  force_refresh?: boolean;
  include_historical?: boolean;
  date_range?: {
    start: string;
    end: string;
  };
}

export interface ChatbotConfig {
  enabled: boolean;
  max_history: number;
  fallback_responses: string[];
  confidence_threshold: number;
  supported_languages: string[];
}