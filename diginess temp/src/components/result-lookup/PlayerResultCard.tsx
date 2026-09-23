import React, { useState, useEffect } from 'react';
import { User, Phone, Target, CheckCircle, XCircle, PartyPopper, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Confetti from './Confetti';
import type { TrialResult } from '@/types/resultLookup';

interface PlayerResultCardProps {
  result: TrialResult;
  className?: string;
  onViewDetails?: () => void;
}

const PlayerResultCard: React.FC<PlayerResultCardProps> = ({
  result,
  className = '',
  onViewDetails,
}) => {
  const [showCelebration, setShowCelebration] = useState(false);
  const [showDisappointment, setShowDisappointment] = useState(false);

  useEffect(() => {
    if (result.selectionStatus === 'Selected') {
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), 3000);
      return () => clearTimeout(timer);
    } if (result.selectionStatus === 'Rejected') {
      setShowDisappointment(true);
      const timer = setTimeout(() => setShowDisappointment(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [result.selectionStatus]);

  const getSelectionStatusIcon = () => {
    switch (result.selectionStatus) {
      case 'Selected':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'Rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'Blank':
        return <User className="w-5 h-5 text-gray-600" />;
      default:
        return null;
    }
  };

  const getSelectionStatusColor = () => {
    switch (result.selectionStatus) {
      case 'Selected':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'Rejected':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'Blank':
        return 'bg-gray-50 border-gray-200 text-gray-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className="relative">
      {/* Google-style Confetti Celebration for Selected Players */}
      <Confetti
        isActive={showCelebration && result.selectionStatus === 'Selected'}
        duration={4000}
        particleCount={120}
      />

      {/* Disappointment Effects for Rejected Players */}
      {showDisappointment && result.selectionStatus === 'Rejected' && (
        <div className="absolute inset-0 pointer-events-none z-10 bg-gray-100 bg-opacity-50 rounded-lg animate-pulse" />
      )}

      <Card className={`w-full max-w-lg mx-auto hover:shadow-xl transition-all duration-700 ease-out transform hover:scale-[1.02] ${
        result.selectionStatus === 'Selected' && showCelebration
          ? 'shadow-green-300/50 border-green-400 bg-linear-to-br from-green-50 to-white ring-2 ring-green-200'
          : result.selectionStatus === 'Rejected' && showDisappointment
          ? 'shadow-gray-300/50 border-gray-400 bg-linear-to-br from-gray-50 to-white'
          : 'shadow-lg border-gray-200 bg-white'
      } ${className}`}>
        <CardHeader className="pb-6 pt-8">
          <CardTitle className={`text-2xl font-bold flex items-center gap-4 ${
            result.selectionStatus === 'Selected'
              ? 'text-green-800'
              : result.selectionStatus === 'Rejected'
              ? 'text-red-800'
              : 'text-gray-900'
          }`}>
            {result.selectionStatus === 'Selected' && showCelebration ? (
              <PartyPopper className="w-8 h-8 text-green-600 animate-bounce" />
            ) : (
              <User className="w-8 h-8 text-blue-600" />
            )}
            Trial Result
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-8 px-8">
          {/* Player Information */}
          <div className="space-y-5">
            <div className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-700 ease-out ${
              result.selectionStatus === 'Selected' && showCelebration
                ? 'bg-linear-to-r from-green-50 to-emerald-50 border-green-300 shadow-md animate-pulse'
                : result.selectionStatus === 'Rejected' && showDisappointment
                ? 'bg-gray-50 border-gray-300'
                : 'bg-linear-to-r from-blue-50 to-indigo-50 border-blue-300'
            }`}>
              <div className="p-2 bg-blue-100 rounded-full">
                <User className="w-6 h-6 text-blue-700" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-lg text-blue-900 leading-tight">{result.name}</div>
                <div className="text-sm font-medium text-blue-700 mt-1">Player Name</div>
              </div>
            </div>

            <div className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-700 ease-out ${
              result.selectionStatus === 'Selected' && showCelebration
                ? 'bg-linear-to-r from-green-50 to-emerald-50 border-green-300 shadow-md animate-pulse'
                : result.selectionStatus === 'Rejected' && showDisappointment
                ? 'bg-gray-50 border-gray-300'
                : 'bg-linear-to-r from-green-50 to-teal-50 border-green-300'
            }`}>
              <div className="p-2 bg-green-100 rounded-full">
                <Phone className="w-6 h-6 text-green-700" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-lg text-green-900 leading-tight">{result.mobile}</div>
                <div className="text-sm font-medium text-green-700 mt-1">Mobile Number</div>
              </div>
            </div>

            <div className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-700 ease-out ${
              result.selectionStatus === 'Selected' && showCelebration
                ? 'bg-linear-to-r from-green-50 to-emerald-50 border-green-300 shadow-md animate-pulse'
                : result.selectionStatus === 'Rejected' && showDisappointment
                ? 'bg-gray-50 border-gray-300'
                : 'bg-linear-to-r from-purple-50 to-pink-50 border-purple-300'
            }`}>
              <div className="p-2 bg-purple-100 rounded-full">
                <Target className="w-6 h-6 text-purple-700" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-lg text-purple-900 leading-tight">{result.points}</div>
                <div className="text-sm font-medium text-purple-700 mt-1">Points Scored</div>
              </div>
            </div>
          </div>

          {/* Selection Status */}
          <div className="pt-6 border-t-2 border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <span className="text-base font-semibold text-gray-800">Selection Status</span>
              <Badge className={`${getSelectionStatusColor()} px-4 py-2 text-sm font-bold transition-all duration-700 ease-out ${
                result.selectionStatus === 'Selected' && showCelebration
                  ? 'animate-bounce scale-110 shadow-lg ring-2 ring-green-300'
                  : result.selectionStatus === 'Rejected' && showDisappointment
                  ? 'animate-pulse'
                  : 'shadow-md'
              }`}>
                {getSelectionStatusIcon()}
                <span className="ml-2">{result.selectionStatus === 'Blank' ? 'Absent' : result.selectionStatus}</span>
              </Badge>
            </div>
          </div>

          {/* Celebration Message for Selected Players */}
          {result.selectionStatus === 'Selected' && showCelebration && (
            <div className="text-center py-6 px-4 bg-linear-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 animate-pulse">
              <div className="text-4xl mb-3 animate-bounce">🎉</div>
              <h3 className="text-xl font-bold text-green-800 mb-2">Congratulations!</h3>
              <p className="text-green-700 font-semibold text-lg">You've been selected!</p>
              <p className="text-sm text-green-600 mt-2 font-medium">Welcome to the team! 🏆</p>
            </div>
          )}

          {/* Empathetic Message for Rejected Players */}
          {result.selectionStatus === 'Rejected' && showDisappointment && (
            <div className="text-center py-6 px-4 bg-linear-to-r from-red-50 to-rose-50 rounded-xl border-2 border-red-200">
              <div className="text-4xl mb-3 animate-pulse">😥</div>
              <h3 className="text-lg font-bold text-red-800 mb-2">We're sorry to inform you...</h3>
              <p className="text-red-700 font-medium">Don't give up! Keep practicing and try again.</p>
              <p className="text-sm text-red-600 mt-2">💪 Your determination will lead to success!</p>
            </div>
          )}

          {/* Message for Blank/Absent Players */}
          {result.selectionStatus === 'Blank' && (
            <div className="text-center py-6 px-4 bg-linear-to-r from-gray-50 to-slate-50 rounded-xl border-2 border-gray-200">
              <div className="text-4xl mb-3">📋</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Status: Absent</h3>
              <p className="text-gray-700 font-medium">You were marked as absent for this trial.</p>
            </div>
          )}

          {/* View Details Button */}
          {onViewDetails && (
            <div className="pt-4 border-t-2 border-gray-100">
              <Button
                onClick={onViewDetails}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                <Eye className="w-5 h-5" />
                View Details
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PlayerResultCard;