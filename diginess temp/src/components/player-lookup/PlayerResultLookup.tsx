import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Search, Users, Trophy, Download, RotateCcw, ArrowLeft, Sparkles, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PlayerSearchForm from './PlayerSearchForm';
import PlayerResultCard from './PlayerResultCard';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
import ExportModal from './ExportModal';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { usePlayerResultLookup } from '@/hooks/usePlayerResultLookup';
import type { PlayerResult } from '@/types/playerData';
import { LEVEL_3_DATA } from '@/data/level3Data';
import CelebrationAnimation from '../animations/CelebrationAnimation';
import DoubleEagleTicketAnimation from '../animations/GoldenTicketAnimation';
import KohinoorTicketAnimation from '../animations/KohinoorTicketAnimation';
import PlatinumTicketAnimation from '../animations/PlatinumTicketAnimation';
import CombinedTicketAnimation from '../animations/CombinedTicketAnimation';
import TripleTicketAnimation from '../animations/TripleTicketAnimation';
import DisappointmentAnimation from '../animations/DisappointmentAnimation';

const PlayerResultLookup: React.FC = () => {
  const navigate = useNavigate();

  const {
    // State
    isLoading,
    error,
    results,
    searchPerformed,
    totalCount,
    isDataReady,
    hasResults,
    totalPlayerCount,

    // Actions
    handleSubmit,
    clearResults,
    exportResults,
    reset,
  } = usePlayerResultLookup();

  // UI State
  const [showExportModal, setShowExportModal] = useState(false);
  const [activeTab, setActiveTab] = useState('search');
  const [showAnimation, setShowAnimation] = useState(false); // Golden Ticket (Single)
  const [showCombinedAnimation, setShowCombinedAnimation] = useState(false);
  const [showPlatinumAnimation, setShowPlatinumAnimation] = useState(false);
  const [showTripleAnimation, setShowTripleAnimation] = useState(false);
  const [showDisappointment, setShowDisappointment] = useState(false);
  const [combinedLevel2Status, setCombinedLevel2Status] = useState<'selected' | 'not_selected'>('selected');
  const [tripleLevel3Status, setTripleLevel3Status] = useState<'selected' | 'not_selected'>('selected');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  // Derived State
  const isPlayerSelected = results.some(p => p.status === 'SELECTED' || p.level2Data?.status === 'SELECTED' || p.level3Data?.status === 'SELECTED');

  // SEO Meta Tags
  const metaTitle = 'SSPL Trials Results - SSPL';
  const metaDescription = 'Search and view cricket trial results for players. Look up results by mobile number or name. Export comprehensive player data and performance reports.';

  // Handle form submission
  const onFormSubmit = async (formData: any) => {
    const success = await handleSubmit(formData);
    if (success) {
      setActiveTab('results');
    }
    return success;
  };

  // Reset selected player when clear results is called
  const onClearResults = () => {
    setSelectedPlayerId(null);
    clearResults();
  };

  // Auto-select if only one result
  useEffect(() => {
    if (searchPerformed && hasResults) {
      if (results.length === 1) {
        setSelectedPlayerId(results[0].id);
      }
    } else {
      setSelectedPlayerId(null);
    }
  }, [results, searchPerformed, hasResults]);

  // Trigger animations when results are loaded
  useEffect(() => {
    if (searchPerformed && hasResults && selectedPlayerId) {
      const player = results.find(p => p.id === selectedPlayerId);
      if (!player) return;

      const isLevel1Selected = player.status === 'SELECTED';
      const isLevel2Selected = player.level2Data?.status === 'SELECTED';
      const isLevel3Selected = player.level3Data?.status === 'SELECTED';

      const level2Status = player.level2Data?.status;
      const isLevel2Declared = level2Status === 'SELECTED' || level2Status === 'NOT_SELECTED' || level2Status === 'NOT SELECTED';

      const level3Status = player.level3Data?.status;
      const isLevel3Declared = level3Status === 'SELECTED' || level3Status === 'NOT_SELECTED' || level3Status === 'NOT SELECTED';

      if (isLevel1Selected && isLevel2Selected && isLevel3Declared) {
        // L1 + L2 Pass and L3 is Declared -> Triple Ticket Animation (Platinum or Better luck)
        setTripleLevel3Status(isLevel3Selected ? 'selected' : 'not_selected');
        setShowTripleAnimation(true);
      } else if (isLevel3Selected) {
        // Highest Priority Fallback: Level 3 Platinum
        setShowPlatinumAnimation(true);
      } else if (isLevel1Selected) {
        if (isLevel2Declared) {
          // L1 Pass + L2 Declared -> Combined (Golden + Kohinoor or Better Luck)
          setCombinedLevel2Status(isLevel2Selected ? 'selected' : 'not_selected');
          setShowCombinedAnimation(true);
        } else {
          // Case 3: L1 Pass + L2 Pending -> Single Golden Ticket
          setShowAnimation(true);
        }
      } else {
        // L1 Fail -> Disappointment
        setShowDisappointment(true);
      }
    }
  }, [results, searchPerformed, hasResults]);

  useEffect(() => {
    if (showAnimation) {
      const timer = setTimeout(() => {
        setShowAnimation(false);
      }, 5000); // Hide animation after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [showAnimation]);

  useEffect(() => {
    if (showCombinedAnimation) {
      const timer = setTimeout(() => {
        setShowCombinedAnimation(false);
      }, 60000); // Longer timeout for combined view
      return () => clearTimeout(timer);
    }
  }, [showCombinedAnimation]);

  useEffect(() => {
    if (showPlatinumAnimation) {
      const timer = setTimeout(() => {
        setShowPlatinumAnimation(false);
      }, 60000);
      return () => clearTimeout(timer);
    }
  }, [showPlatinumAnimation]);


  // Handle export
  const onExport = async (format: 'csv' | 'json' | 'pdf', fields: (keyof PlayerResult)[]) => {
    await exportResults(format, fields);
  };

  // Render search form
  const renderSearchForm = () => (
    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center bg-linear-to-r from-sport-orange via-[#A2D300] to-sport-gold text-white p-4 rounded-xl shadow-xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-[url('/placeholder.svg')] opacity-10 bg-center bg-cover mix-blend-overlay"></div>
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-3xl group-hover:bg-white/30 transition-all duration-700"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-yellow-400/20 rounded-full blur-3xl group-hover:bg-yellow-400/30 transition-all duration-700"></div>

        <div className="relative z-10">
          <div className="flex justify-center mb-2">
            <img src="/ssplt10-logo.png" alt="SSPL Logo" className="h-14 w-auto object-contain drop-shadow-lg" />
          </div>
          <h2 className="text-xl sm:text-2xl font-heading font-bold mb-1 drop-shadow-md flex items-center justify-center gap-2">
            <Search className="w-5 h-5 sm:w-6 sm:h-6" />
            Search Player Results
          </h2>
          <p className="text-sm sm:text-base text-white/95 font-medium max-w-xl mx-auto">
            Enter your registered mobile number to discover your trial status.
          </p>
        </div>
      </div>

      <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-3 sm:p-4">
          <PlayerSearchForm
            onSubmit={onFormSubmit}
            isLoading={isLoading}
            className="mx-auto max-w-xl"
          />
        </CardContent>
      </Card>
    </div>
  );

  // Render search results
  const renderResults = () => {
    if (isLoading) {
      return <LoadingState message="Searching for player results..." showSkeleton={true} />;
    }

    if (error && searchPerformed) {
      return (
        <ErrorState
          error={error}
          onClear={onClearResults}
          showClearButton={true}
          showRetryButton={true}
        />
      );
    }

    if (searchPerformed && !hasResults) {
      return (
        <div className="text-center py-12 animate-in fade-in zoom-in duration-500">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl max-w-md mx-auto border border-gray-100">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <User className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 font-heading">No Player Found</h3>
            <p className="text-gray-500">
              We couldn't find any certificates with those details. Please check the information and try again.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700">

        {/* Animations */}
        {showAnimation && selectedPlayerId && (
          <DoubleEagleTicketAnimation
            player={results.find(p => p.id === selectedPlayerId) || results[0]}
            onClose={() => setShowAnimation(false)}
          />
        )}

        {showPlatinumAnimation && selectedPlayerId && (
          <PlatinumTicketAnimation
            player={results.find(p => p.id === selectedPlayerId) || results[0]}
            onClose={() => setShowPlatinumAnimation(false)}
          />
        )}

        {showCombinedAnimation && selectedPlayerId && (
          <CombinedTicketAnimation
            player={results.find(p => p.id === selectedPlayerId) || results[0]} 
            level2Status={combinedLevel2Status}
            onClose={() => setShowCombinedAnimation(false)}
          />
        )}

        {showTripleAnimation && selectedPlayerId && (
          <TripleTicketAnimation
            player={results.find(p => p.id === selectedPlayerId) || results[0]}
            level3Status={tripleLevel3Status}
            onClose={() => setShowTripleAnimation(false)}
          />
        )}

        {/* Disappointment Animation if neither selected */}
        {!isPlayerSelected && showDisappointment && (
          <DisappointmentAnimation onClose={() => setShowDisappointment(false)} />
        )}

        {/* Results Header */}
        <div className="flex flex-col md:flex-row items-center justify-between bg-linear-to-r from-sport-teal via-cyan-700 to-sport-blue rounded-xl p-3 sm:p-4 shadow-xl border border-white/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%,transparent_100%)] bg-size-[250%_250%,100%_100%] animate-[shimmer_3s_infinite]"></div>

          <div className="flex items-center gap-3 relative z-10 mb-3 md:mb-0">
            <div className="p-2 bg-white/10 backdrop-blur-md rounded-full shadow-lg border border-white/20">
              <Trophy className="w-5 h-5 text-yellow-300 drop-shadow-md" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-heading font-bold text-white drop-shadow-md">
                Search Results
              </h2>
              <p className="text-blue-100 text-xs font-medium">
                Found {results.length} player{results.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="flex gap-3 relative z-10">
            <Button
              variant="secondary"
              size="sm"
              onClick={onClearResults}
              className="bg-white/10 text-white hover:bg-white/20 border-white/20 backdrop-blur-sm font-semibold"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              New Search
            </Button>
          </div>
        </div>

        {/* Name Selection for Multiple Results */}
        {results.length > 1 && !selectedPlayerId && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl animate-in fade-in zoom-in duration-500 max-w-2xl mx-auto">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="p-4 bg-orange-500/10 rounded-full border border-orange-500/20">
                <Users className="w-10 h-10 text-orange-500" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white font-heading tracking-tight">Multiple Players Found</h3>
                <p className="text-slate-400 text-base max-w-sm mx-auto">
                  Multiple players are registered with this mobile number. Please select a name to view results.
                </p>
              </div>

              <div className="w-full max-w-xs space-y-3">
                <label className="text-sm font-semibold text-slate-500 uppercase tracking-wider block">
                  Select Player Name
                </label>
                <Select
                  value={selectedPlayerId || ""}
                  onValueChange={(value) => setSelectedPlayerId(value)}
                >
                  <SelectTrigger className="w-full bg-slate-800 border-slate-700 text-white h-12 text-lg font-medium ring-offset-slate-900 focus:ring-orange-500">
                    <SelectValue placeholder="Choose name..." />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white">
                    {results.map((player) => (
                      <SelectItem key={player.id} value={player.id} className="focus:bg-slate-700 focus:text-white">
                        {player.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Selected Player Dropdown (Shown after selection for switching) */}
        {results.length > 1 && selectedPlayerId && (
          <div className="bg-slate-900/40 backdrop-blur-sm border border-white/5 rounded-xl p-3 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Switch Player:</span>
            </div>
            <div className="w-48">
              <Select
                value={selectedPlayerId || ""}
                onValueChange={(value) => setSelectedPlayerId(value)}
              >
                <SelectTrigger className="h-8 bg-transparent border-0 text-white text-sm font-medium focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  {results.map((player) => (
                    <SelectItem key={player.id} value={player.id}>
                      {player.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Results List */}
        <div className="space-y-3">
          {results
            .filter(player => (results.length === 1 || selectedPlayerId) && (!selectedPlayerId || player.id === selectedPlayerId))
            .map((player, index) => (
              <div
                key={player.id}
                className={`animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards animation-delay-[${index * 150}ms]`}
              >
                <PlayerResultCard
                  player={player}
                  className="transform transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                  compact={true} // Use compact mode by default
                />
              </div>
            ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={window.location.href} />
      </Helmet>

      {/* Colorful Background */}
      <div className="min-h-screen bg-linear-to-br from-blue-600 via-indigo-600 to-purple-700">
        {/* Header */}
        <div className="bg-black/20 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2">
            <div className="flex items-center justify-between relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="text-white hover:text-white hover:bg-white/10 flex items-center gap-2 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline font-medium">Back</span>
              </Button>

              <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-sport-gold animate-pulse" />
                <h1 className="text-lg sm:text-xl font-heading font-bold text-white tracking-wide">
                  SSPL TRIALS
                </h1>
              </div>

              <div className="w-10 sm:w-20"></div> {/* Spacer for centering */}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4 bg-black/20 p-1 rounded-xl backdrop-blur-sm border border-white/10">
              <TabsTrigger
                value="search"
                className="data-[state=active]:bg-sport-orange data-[state=active]:text-white text-white/70 font-bold text-base py-2 rounded-lg transition-all duration-300"
              >
                <Search className="w-4 h-4 mr-2" />
                Search
              </TabsTrigger>
              <TabsTrigger
                value="results"
                disabled={!hasResults && !searchPerformed}
                className="data-[state=active]:bg-sport-teal data-[state=active]:text-white text-white/70 font-bold text-base py-2 rounded-lg transition-all duration-300 disabled:opacity-30"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Results
              </TabsTrigger>
            </TabsList>

            <TabsContent value="search" className="space-y-4 outline-none">
              {renderSearchForm()}
            </TabsContent>

            <TabsContent value="results" className="space-y-4 outline-none">
              {renderResults()}
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="bg-black/30 backdrop-blur-md border-t border-white/10 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="text-center">
              <p className="text-base font-heading font-bold text-white drop-shadow-md">
                <span className="text-sport-gold">SSPL</span> - Sports Excellence Platform
              </p>
            </div>
          </div>
        </div>

        {/* Export Modal */}
        {hasResults && (
          <ExportModal
            results={results}
            isOpen={showExportModal}
            onClose={() => setShowExportModal(false)}
            onExport={onExport}
          />
        )}
      </div>
    </>
  );
};

export default PlayerResultLookup;