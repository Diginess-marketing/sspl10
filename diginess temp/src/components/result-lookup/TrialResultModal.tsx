import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  User,
  Phone,
  Target,
  Trophy,
  CheckCircle,
  XCircle,
  PartyPopper,
  Calendar,
  Clock,
  Star,
  TrendingUp,
} from 'lucide-react';
import Confetti from './Confetti';
import type { TrialResult } from '@/types/resultLookup';

interface TrialResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: TrialResult;
  showConfetti?: boolean;
}

const TrialResultModal: React.FC<TrialResultModalProps> = ({
  isOpen,
  onClose,
  result,
  showConfetti = true,
}) => {
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (isOpen && result.selectionStatus === 'Selected' && showConfetti) {
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, result.selectionStatus, showConfetti]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSelectionStatusIcon = () => {
    switch (result.selectionStatus) {
      case 'Selected':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'Rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
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
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getPointsLevel = (points: number) => {
    if (points >= 90) return { level: 'Excellent', color: 'text-purple-600', bg: 'bg-purple-100' };
    if (points >= 80) return { level: 'Very Good', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (points >= 70) return { level: 'Good', color: 'text-green-600', bg: 'bg-green-100' };
    if (points >= 60) return { level: 'Average', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { level: 'Needs Improvement', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const pointsLevel = getPointsLevel(result.points);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* Confetti Animation for Selected Players */}
      <Confetti
        isActive={showCelebration && result.selectionStatus === 'Selected'}
        duration={4000}
        particleCount={120}
      />

      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="pb-4 pt-6 px-6">
          <DialogTitle className="flex items-center gap-3 text-xl">
            {result.selectionStatus === 'Selected' && showCelebration ? (
              <PartyPopper className="w-6 h-6 text-green-600 animate-bounce" />
            ) : (
              <Trophy className="w-6 h-6 text-blue-600" />
            )}
            Trial Result Details
          </DialogTitle>
          <DialogDescription>
            Comprehensive information about your trial performance and selection status.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-4">
          {/* Player Information Card */}
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                Player Information
              </h3>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-gray-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-600">Full Name</p>
                    <p className="font-semibold text-sm text-gray-900 truncate">{result.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-600">Mobile Number</p>
                    <p className="font-semibold text-sm text-gray-900">{result.mobile}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics Card */}
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-600" />
                Performance Metrics
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-linear-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                  <div className="text-2xl font-bold text-purple-800 mb-1">{result.points}</div>
                  <div className="text-xs text-purple-600 font-medium">Points Scored</div>
                  <Badge className={`${pointsLevel.bg} ${pointsLevel.color} text-xs mt-1`}>
                    {pointsLevel.level}
                  </Badge>
                </div>

                <div className="text-center p-3 bg-linear-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <div className="text-2xl font-bold text-green-800 mb-1">
                    {result.selectionStatus === 'Selected' ? '✓' : '✗'}
                  </div>
                  <div className="text-xs text-green-600 font-medium">Status</div>
                  <Badge className={`${getSelectionStatusColor()} text-xs mt-1`}>
                    {result.selectionStatus}
                  </Badge>
                </div>
              </div>

              {/* Performance Indicator */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-800">Performance Level</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-1000 ${
                      result.points >= 80
                        ? 'bg-green-500'
                        : result.points >= 60
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(result.points, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>0</span>
                  <span>50</span>
                  <span>100</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline Information Card */}
          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-4">
              <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-600" />
                Timeline Information
              </h3>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-600">Trial Registered</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(result.created_at)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-600">Result Updated</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(result.updated_at)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selection Status Card */}
          <Card className={`border-l-4 ${
            result.selectionStatus === 'Selected' ? 'border-l-green-500' : 'border-l-red-500'
          }`}>
            <CardContent className="p-4">
              <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                {getSelectionStatusIcon()}
                Selection Status
              </h3>

              <div className={`p-4 rounded-lg border-2 ${
                result.selectionStatus === 'Selected'
                  ? 'bg-linear-to-r from-green-50 to-emerald-50 border-green-200'
                  : 'bg-linear-to-r from-red-50 to-pink-50 border-red-200'
              }`}>
                <div className="text-center">
                  <div className={`text-3xl mb-2 ${
                    result.selectionStatus === 'Selected' ? 'animate-bounce' : 'animate-pulse'
                  }`}>
                    {result.selectionStatus === 'Selected' ? '🎉' : '😔'}
                  </div>
                  <h4 className={`text-lg font-bold mb-2 ${
                    result.selectionStatus === 'Selected' ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {result.selectionStatus === 'Selected' ? 'Congratulations!' : 'Thank You'}
                  </h4>
                  <p className={`text-sm font-medium ${
                    result.selectionStatus === 'Selected' ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {result.selectionStatus === 'Selected'
                      ? 'You have been selected for the team! Welcome aboard!'
                      : 'Thank you for participating. Keep practicing and try again in the future.'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 text-sm"
            >
              Close
            </Button>

            {result.selectionStatus === 'Selected' && (
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700 text-sm flex items-center gap-2"
                onClick={() => {
                  // Future action for selected players
                  console.log('Selected player action');
                }}
              >
                <Star className="w-4 h-4" />
                Next Steps
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TrialResultModal;