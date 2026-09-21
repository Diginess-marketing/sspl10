import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  MessageCircle,
  Send,
  Bot,
  User,
  X,
  Minimize2,
  Maximize2,
  RefreshCw,
  HelpCircle,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  PhoneCall,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { faqData, Language } from '@/data/faqData';
import { supabase } from '@/integrations/supabase/client';
import type {
  ChatMessage,
  ChatbotQuery,
  ChatbotResponse,
  SSPLTeam,
  SSPLPlayer,
  SSPLMatch,
  SSPLNews,
} from '@/types/sspl';

interface SSPLChatbotProps {
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

const SSPLChatbot: React.FC<SSPLChatbotProps> = ({ isOpen, onToggle, className = '' }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();
  const { user, userRole } = useAuth();

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isVoiceChatMode, setIsVoiceChatMode] = useState(false);
  const [transcriptToSubmit, setTranscriptToSubmit] = useState<string | null>(null);

  // Flatten English FAQs for searching
  const englishFaqs = React.useMemo(() => {
    if (!faqData['en']) return [];
    return faqData['en'].flatMap(cat => cat.items);
  }, []);

  // State for real data from database
  const [realData, setRealData] = useState({
    teams: [] as SSPLTeam[],
    players: [] as SSPLPlayer[],
    matches: [] as SSPLMatch[],
    news: [] as SSPLNews[],
    loading: true,
  });

  // Fetch real data from database
  useEffect(() => {
    const fetchRealData = async () => {
      try {
        setRealData(prev => ({ ...prev, loading: true }));

        // For now, use sample data since database tables may not be created yet
        // TODO: Replace with actual database queries once tables are available
        const teamsData: SSPLTeam[] = [
          { id: '1', name: 'Chennai Champions', city: 'Chennai', captain: 'Rahul Sharma', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: '2', name: 'Bangalore Blasters', city: 'Bangalore', captain: 'Vikram Singh', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: '3', name: 'Mumbai Mavericks', city: 'Mumbai', captain: 'Arjun Patel', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        ];

        const playersData: SSPLPlayer[] = [
          { id: '1', name: 'Rahul Sharma', position: 'batsman', team_id: '1', is_active: true, stats: { matches: 15, runs: 450, wickets: 0, centuries: 1, fifties: 2, highest_score: 120, best_bowling: '', average: 30.0, strike_rate: 125.5 }, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: '2', name: 'Vikram Singh', position: 'bowler', team_id: '2', is_active: true, stats: { matches: 12, runs: 80, wickets: 18, centuries: 0, fifties: 0, highest_score: 25, best_bowling: '3/15', average: 22.5, strike_rate: 85.0 }, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        ];

        const matchesData: SSPLMatch[] = [
          { id: '1', match_number: 1, season: '2024', date: '2024-09-15', time: '19:00:00', venue: 'Chennai Cricket Ground', team_a_id: '1', team_b_id: '2', result: 'upcoming', match_type: 'league', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        ];

        const newsData: SSPLNews[] = [
          { id: '1', title: 'SSPL T10 Season 2024 Begins!', content: 'The much-awaited SSPL T10 season is set to begin with exciting matches and talented players from across the region.', excerpt: 'Season 2024 kicks off with high expectations', author: 'SSPL Admin', category: 'league', tags: ['season', '2024', 'tournament'], published_date: '2024-08-30T10:00:00Z', is_featured: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        ];

        // No errors to handle with sample data

        setRealData({
          teams: teamsData || [],
          players: playersData || [],
          matches: matchesData || [],
          news: newsData || [],
          loading: false,
        });

      } catch (error) {
        setRealData(prev => ({ ...prev, loading: false }));
      }
    };

    fetchRealData();
  }, []);

  // Setup Speech Recognition
  useEffect(() => {
    if ('SpeechRecognition' in (window as any) || 'webkitSpeechRecognition' in (window as any)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
          const finalStr = finalTranscript.trim();
          setInputMessage(finalStr);
          setIsListening(false);
          setTranscriptToSubmit(finalStr);
        } else {
          setInputMessage(interimTranscript);
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListen = () => {
    if (!recognitionRef.current) {
      toast({ title: 'Not Supported', description: 'Voice input is not supported in this browser.', variant: 'destructive' });
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      window.speechSynthesis.cancel(); // Stop speaking if starting to listen
      setIsSpeaking(false);
      setInputMessage('');
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch(e) {
        setIsListening(false);
      }
    }
  };

  const speakText = (text: string) => {
    if (!voiceEnabled || !window.speechSynthesis) return;
    
    window.speechSynthesis.cancel();
    
    // Clean text for speech (remove markdown)
    const cleanText = text.replace(/[\*\[\]\(\)]/g, '').replace(/[\u{1F300}-\u{1F9FF}]/gu, '');
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      // If continuous Voice Chat is active, immediately start listening again
      if (isVoiceChatMode) {
        setTimeout(() => {
          try {
            if (!isListening) {
               recognitionRef.current?.start();
               setIsListening(true);
            }
          } catch(e) {}
        }, 800);
      }
    };
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const toggleVoiceChatMode = () => {
    if (isVoiceChatMode) {
      setIsVoiceChatMode(false);
      if (recognitionRef.current) recognitionRef.current.stop();
      window.speechSynthesis.cancel();
      setIsListening(false);
      setIsSpeaking(false);
      toast({ title: 'Voice Chat Ended', description: 'Continuous voice chat session has been stopped.' });
    } else {
      if (!recognitionRef.current) {
        toast({ title: 'Not Supported', description: 'Voice input is not supported in this browser.', variant: 'destructive' });
        return;
      }
      setIsVoiceChatMode(true);
      setVoiceEnabled(true);
      window.speechSynthesis.cancel();
      setInputMessage('');
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch(e) {
        setIsListening(false);
      }
      toast({ title: 'Voice Chat Started', description: 'I am listening! Say something like "What is the fee?"' });
    }
  };

  // Process auto-submitted transcripts safely outside of speech recognition closure
  useEffect(() => {
    if (transcriptToSubmit) {
      handleSendMessage(transcriptToSubmit);
      setTranscriptToSubmit(null);
    }
  }, [transcriptToSubmit]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        content: `Hello${user ? ` ${user.email?.split('@')[0]}` : ''}! 👋 I'm your SSPL assistant. I can help you with:

• Tournament Eligibility & Registration Fill
• Fees and Payments
• Trials Format & Selection Process
• Match schedules and results

What would you like to know about SSPL? You can type or use the microphone.`,
        sender: 'bot',
        timestamp: new Date(),
        type: 'text',
      };
      setMessages([welcomeMessage]);
    }
  }, [user, messages.length]);

  // Simple NLP-like keyword matching
  const analyzeQuery = (text: string): ChatbotQuery => {
    const lowerText = text.toLowerCase();
    
    // 1. FAQ Intent Matching
    let bestFaqMatch = null;
    let highestScore = 0;
    
    const noise = ['how', 'can', 'i', 'what', 'is', 'the', 'are', 'do', 'need', 'to', 'for', 'in', 'of', 'and', 'my', 'about', 'a'];
    const searchWords = lowerText.replace(/[?.,!-]/g, ' ').split(/\s+/).filter(w => w.length > 2 && !noise.includes(w));
    
    if (searchWords.length > 0) {
      for (const faq of englishFaqs) {
        const qWords = faq.question.toLowerCase().replace(/[?.,!-]/g, ' ').split(/\s+/).filter(w => !noise.includes(w));
        const aWords = faq.answer.toLowerCase().replace(/[?.,!-]/g, ' ').split(/\s+/).filter(w => !noise.includes(w));
        
        let matches = 0;
        for (const sw of searchWords) {
          if (qWords.some(qw => qw.includes(sw) || sw.includes(qw))) {
            matches += 2; // Weight questions higher
          } else if (aWords.some(aw => aw.includes(sw) || sw.includes(aw))) {
            matches += 1; // Weight answers lower
          }
        }
        
        let score = matches / Math.max(searchWords.length, qWords.length * 0.5);
        
        if (score > highestScore) {
          highestScore = score;
          bestFaqMatch = faq;
        }
      }
    }
    
    if (bestFaqMatch && highestScore >= 0.5) {
      return {
        text,
        intent: 'faq',
        entities: { faq: bestFaqMatch },
        confidence: highestScore,
      };
    }

    let intent = 'general';
    const entities: Record<string, any> = {};

    // Team-related queries
    if (lowerText.includes('team') || lowerText.includes('teams')) {
      intent = 'teams';
      if (lowerText.includes('chennai')) entities.team = 'Chennai Champions';
      if (lowerText.includes('bangalore')) entities.team = 'Bangalore Blasters';
      if (lowerText.includes('mumbai')) entities.team = 'Mumbai Mavericks';
    }

    // Player-related queries
    else if (lowerText.includes('player') || lowerText.includes('players') ||
      lowerText.includes('captain') || lowerText.includes('batsman') ||
      lowerText.includes('bowler')) {
      intent = 'players';
      if (lowerText.includes('rahul')) entities.player = 'Rahul Sharma';
      if (lowerText.includes('vikram')) entities.player = 'Vikram Singh';
    }

    // Match-related queries
    else if (lowerText.includes('match') || lowerText.includes('matches') ||
      lowerText.includes('schedule') || lowerText.includes('fixture')) {
      intent = 'matches';
    }

    // News-related queries
    else if (lowerText.includes('news') || lowerText.includes('latest') ||
      lowerText.includes('update')) {
      intent = 'news';
    }

    // Standings queries
    else if (lowerText.includes('standing') || lowerText.includes('table') ||
      lowerText.includes('rank')) {
      intent = 'standings';
    }

    return {
      text,
      intent,
      entities,
      confidence: 0.8, // Simple implementation
    };
  };

  // Generate response based on query analysis
  const generateResponse = (query: ChatbotQuery): ChatbotResponse => {
    const { intent, entities } = query;

    switch (intent) {
      case 'faq':
        if (entities.faq) {
          return {
            text: `🎯 **${entities.faq.question}**\n\n${entities.faq.answer}`,
            type: 'text',
          };
        }
        // Fall back to default if no FAQ found
        return {
          text: "I couldn't find an exact FAQ for that. Can you rephrase?",
          type: 'text',
          suggestions: ['How to register?', 'Registration fee?']
        };
      case 'teams':
        if (entities.team) {
          const team = realData.teams.find(t => t.name === entities.team);
          if (team) {
            return {
              text: `📍 **${team.name}**\n\n🏙️ **City:** ${team.city}\n👨‍⚽ **Captain:** ${team.captain}\n\nWould you like to know more about their players or recent matches?`,
              type: 'text',
              data: team,
            };
          }
        }
        return {
          text: `🏆 Here are the SSPL teams:\n\n${realData.teams.map(team => `• ${team.name} (${team.city})`).join('\n')}\n\nWhich team would you like to know more about?`,
          type: 'text',
          data: realData.teams,
        };

      case 'players':
        if (entities.player) {
          const player = realData.players.find(p => p.name === entities.player);
          if (player) {
            return {
              text: `🏏 **${player.name}**\n\n📊 **Position:** ${player.position}\n⚽ **Team:** ${realData.teams.find(t => t.id === player.team_id)?.name}\n\nWould you like to see their statistics or other players?`,
              type: 'text',
              data: player,
            };
          }
        }
        return {
          text: `👥 Here are some key players:\n\n${realData.players.map(player => `• ${player.name} (${player.position})`).join('\n')}\n\nAsk me about a specific player for more details!`,
          type: 'text',
          data: realData.players,
        };

      case 'matches':
        return {
          text: `📅 **Upcoming Matches:**\n\n${realData.matches.map(match => {
            const teamA = realData.teams.find(t => t.id === match.team_a_id);
            const teamB = realData.teams.find(t => t.id === match.team_b_id);
            return `• ${teamA?.name} vs ${teamB?.name} (${match.date})`;
          }).join('\n')}\n\nWould you like match details or results?`,
          type: 'text',
          data: realData.matches,
        };

      case 'news':
        return {
          text: `📰 **Latest News:**\n\n${realData.news.map(article => `• ${article.title} (${new Date(article.published_date).toLocaleDateString()})`).join('\n')}\n\nWould you like to read the full article?`,
          type: 'text',
          data: realData.news,
        };

      case 'standings':
        return {
          text: '📊 **Current Standings:**\n\n1. Chennai Champions (12 pts)\n2. Bangalore Blasters (10 pts)\n3. Mumbai Mavericks (8 pts)\n\n*Note: This is sample data for demonstration*',
          type: 'text',
        };

      default:
        // Fallback responses for unrecognized queries
        const fallbacks = [
          "I'm here to help with SSPL information! Try asking about registration, trials, or fees.",
          'I can tell you about SSPL eligibility, trials schedule, and selection process. What interests you?',
          "I have answers from our FAQ. You can ask me how to check your results or about the tournament format.",
          'Need SSPL info? Send me a text or click the mic to ask a question.',
        ];
        return {
          text: fallbacks[Math.floor(Math.random() * fallbacks.length)],
          type: 'text',
          suggestions: ['How to register?', 'Registration fee?', 'When do trials end?', 'Check my results'],
        };
    }
  };

  const handleSendMessage = async (inputEventOrString?: string | React.MouseEvent | React.KeyboardEvent) => {
    const textToProcess = typeof inputEventOrString === 'string' ? inputEventOrString : inputMessage;
    if (!textToProcess.trim()) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      content: textToProcess,
      sender: 'user',
      timestamp: new Date(),
      type: 'text',
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Prepare chat history for AI (last 5 messages)
      const chatHistory = messages
        .filter(m => m.id !== 'welcome')
        .slice(-5)
        .map(m => ({
          role: m.sender === 'bot' ? 'assistant' : 'user',
          content: m.content
        }));

      let botResponseText = '';
      let isAiResponse = false;

      // Try calling Supabase Edge Function for AI response
      try {
        const { data, error } = await supabase.functions.invoke('chat', {
          body: {
            message: textToProcess,
            history: chatHistory,
            mobile: user?.phone || null,
            mode: 'customer_care',
            language: localStorage.getItem('selectedLanguage') || 'en'
          }
        });

        if (error) throw error;
        if (data && data.response) {
          botResponseText = data.response;
          isAiResponse = true;
        }
      } catch (aiError) {
        console.error('AI Chatbot Error, falling back to local FAQ:', aiError);
      }

      // Fallback to local FAQ logic if AI failed or returned empty
      if (!isAiResponse) {
        const query = analyzeQuery(textToProcess);
        const localResponse = generateResponse(query);
        botResponseText = localResponse.text;
      }

      const botMessage: ChatMessage = {
        id: `bot_${Date.now()}`,
        content: botResponseText,
        sender: 'bot',
        timestamp: new Date(),
        type: 'text',
        metadata: {
          is_ai: isAiResponse,
        },
      };

      setMessages(prev => [...prev, botMessage]);
      speakText(botResponseText);

      // Show suggestions if available (only for local common queries or if AI didn't provide any)
      if (!isAiResponse) {
        const query = analyzeQuery(textToProcess);
        const suggestions = generateResponse(query).suggestions;
        if (suggestions && suggestions.length > 0) {
          setTimeout(() => {
            const suggestionMessage: ChatMessage = {
              id: `suggestions_${Date.now()}`,
              content: `💡 **Quick suggestions:** ${suggestions.join(' • ')}`,
              sender: 'bot',
              timestamp: new Date(),
              type: 'text',
            };
            setMessages(prev => [...prev, suggestionMessage]);
          }, 500);
        }
      }

    } catch (error) {
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        content: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date(),
        type: 'error',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{
      id: 'welcome',
      content: 'Chat cleared! How can I help you with SSPL information?',
      sender: 'bot',
      timestamp: new Date(),
      type: 'text',
    }]);
  };

  if (!isOpen) {
    return (
      <div className={`fixed bottom-24 md:bottom-6 right-4 md:right-6 z-[100001] ${className}`}>
        <button
          onClick={onToggle}
          className="rounded-full p-3 md:p-4 bg-cricket-blue hover:bg-cricket-dark-blue shadow-lg border-2 border-white/20 transition-all duration-300 hover:scale-110 flex items-center justify-center"
        >
          <MessageCircle className="w-8 h-8 md:w-10 md:h-10 text-white" />
        </button>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-24 md:bottom-6 right-3 md:right-6 z-[100001] ${className} animate-in fade-in slide-in-from-top-4 duration-300`}>
      <Card className={`w-96 ${isMinimized ? 'h-14' : 'max-h-[calc(100vh-150px)] h-[550px]'} shadow-2xl border-2 border-cricket-blue bg-white overflow-hidden flex flex-col transition-all duration-300`}>
        {/* Header */}
        <CardHeader className="bg-[#000080] text-white p-3 cursor-pointer border-b border-white/20" onClick={() => setIsMinimized(!isMinimized)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <CardTitle className="text-sm font-medium">SSPL Assistant</CardTitle>
              {userRole === 'admin' && (
                <Badge variant="secondary" className="text-xs">
                  Admin
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleVoiceChatMode();
                }}
                className={`h-6 w-6 p-0 text-white flex items-center justify-center mr-1 ${isVoiceChatMode ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'hover:bg-white/20'}`}
                title={isVoiceChatMode ? "End Voice Chat" : "Start Voice Chat"}
              >
                <PhoneCall className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMinimized(!isMinimized);
                }}
                className="h-6 w-6 p-0 text-white hover:bg-white/20"
              >
                {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
                className="h-6 w-6 p-0 text-white hover:bg-white/20"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <>
            {/* Messages */}
            <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
              <ScrollArea className="flex-1 p-3">
                <div className="space-y-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl p-3 shadow-lg ${message.sender === 'user'
                            ? 'bg-cricket-blue text-white rounded-br-none'
                            : message.type === 'error'
                              ? 'bg-red-50 text-red-900 border-red-200'
                              : 'bg-white text-slate-900 border border-slate-200 rounded-bl-none'
                          } border`}
                        style={{ color: message.sender === 'user' ? '#ffffff' : '#0f172a', backgroundColor: message.sender === 'user' ? '#000080' : '#ffffff' }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {message.sender === 'user' ? (
                            <User className="w-3 h-3" />
                          ) : (
                            <Bot className="w-3 h-3" />
                          )}
                          <span className="text-xs opacity-70">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="text-sm whitespace-pre-wrap">
                          {message.content}
                        </div>
                        {message.metadata?.confidence && (
                          <div className="text-xs opacity-50 mt-1">
                            Confidence: {Math.round(message.metadata.confidence * 100)}%
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-slate-100 border border-slate-200 rounded-2xl p-3 max-w-[80%] rounded-bl-none">
                        <div className="flex items-center gap-2">
                          <Bot className="w-3 h-3 text-cricket-blue" />
                          <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </CardContent>

            {/* Input */}
            <div className="p-3 border-t">
              <div className="flex gap-2 relative">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={isListening ? "Listening..." : "Ask your question..."}
                  className={`flex-1 bg-white text-slate-900 border-slate-200 pr-10 focus:ring-cricket-blue ${isListening ? 'border-red-400 ring-2 ring-red-200' : ''}`}
                  style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
                  disabled={isTyping}
                />
                <Button
                  onClick={toggleListen}
                  variant="ghost"
                  type="button"
                  className={`absolute right-12 top-1/2 -translate-y-1/2 h-8 w-8 p-0 rounded-full ${isListening ? 'text-red-500 bg-red-50 hover:bg-red-100 hover:text-red-600 animate-pulse' : 'text-slate-500 hover:text-cricket-blue hover:bg-slate-100'}`}
                >
                  {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </Button>
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  className="bg-cricket-blue hover:bg-cricket-dark-blue shrink-0 shadow-md"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-auto p-0 text-xs ${voiceEnabled ? 'text-green-600' : 'text-slate-400'}`}
                    onClick={() => {
                      if (voiceEnabled) {
                        window.speechSynthesis.cancel();
                        setIsSpeaking(false);
                      }
                      setVoiceEnabled(!voiceEnabled);
                    }}
                  >
                    {voiceEnabled ? <Volume2 className="w-3 h-3 mr-1" /> : <VolumeX className="w-3 h-3 mr-1" />}
                    {voiceEnabled ? 'Voice On' : 'Voice Off'}
                  </Button>
                  {isSpeaking && <span className="text-[10px] text-cricket-blue flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-cricket-blue animate-ping"></div> Speaking</span>}
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={clearChat}
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-xs"
                    title="Clear chat"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" /> Clear
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-xs"
                    onClick={() => toast({
                      title: 'Voice Controls',
                      description: 'Click the Microphone to speak your question. The bot will automatically speak responses back to you.',
                    })}
                  >
                    <HelpCircle className="w-3 h-3 mr-1" />
                    Help
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default SSPLChatbot;