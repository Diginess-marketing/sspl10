import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Play, CheckCircle, Star, Users, Trophy, Calendar } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { cn } from '@/lib/utils';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  content: React.ReactNode;
  target?: string; // CSS selector for highlighting
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

interface EnhancedOnboardingProps {
  steps: OnboardingStep[];
  onComplete: () => void;
  onSkip?: () => void;
  autoStart?: boolean;
  showProgress?: boolean;
  className?: string;
}

const EnhancedOnboarding: React.FC<EnhancedOnboardingProps> = ({
  steps,
  onComplete,
  onSkip,
  autoStart = true,
  showProgress = true,
  className = '',
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(autoStart);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!isVisible) return;

    // Highlight target element if specified
    const currentStepData = steps[currentStep];
    if (currentStepData.target) {
      const targetElement = document.querySelector(currentStepData.target);
      if (targetElement) {
        targetElement.classList.add('onboarding-highlight');
        return () => {
          targetElement.classList.remove('onboarding-highlight');
        };
      }
    }
  }, [currentStep, isVisible, steps]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setCompletedSteps(prev => new Set([...prev, currentStep]));
    setIsVisible(false);
    onComplete();
  };

  const handleSkip = () => {
    setIsVisible(false);
    onSkip?.();
  };

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40 pointer-events-none" />

      {/* Onboarding Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-2xl border-2 border-cricket-blue/20">
          <CardHeader className="relative">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold text-cricket-blue">
                {currentStepData.title}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Progress Bar */}
            {showProgress && (
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Step {currentStep + 1} of {steps.length}</span>
                  <span>{Math.round(progress)}% Complete</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-gray-700 leading-relaxed">
              {currentStepData.description}
            </p>

            {/* Step Content */}
            <div className="bg-gray-50 rounded-lg p-4">
              {currentStepData.content}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Skip Tour
                </Button>

                <Button
                  onClick={handleNext}
                  className="bg-gradient-primary hover:opacity-90 flex items-center gap-2"
                >
                  {currentStep === steps.length - 1 ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Get Started
                    </>
                  ) : (
                    <>
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

// Pre-configured onboarding flows for common use cases
export const SSPLOnboarding: React.FC<{
  onComplete: () => void;
  onSkip?: () => void;
}> = ({ onComplete, onSkip }) => {
  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to SSPL T10!',
      description: 'Get ready to experience the most exciting cricket tournament in India.',
      content: (
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h3 className="font-bold text-lg">Southern Street Premier League</h3>
          <p className="text-sm text-gray-600">T10 Tennis Ball Cricket Championship</p>
          <div className="flex justify-center gap-4 mt-4">
            <Badge className="bg-gradient-accent">₹3 Crores Prize</Badge>
            <Badge className="bg-gradient-sunset">12 Teams</Badge>
            <Badge className="bg-gradient-ocean">Sharjah Finals</Badge>
          </div>
        </div>
      ),
    },
    {
      id: 'registration',
      title: 'Player Registration',
      description: 'Register as a player and join your favorite team.',
      content: (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-accent rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold">Easy Registration</h4>
              <p className="text-sm text-gray-600">Fill out your details and pay securely</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-sunset rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold">Team Selection</h4>
              <p className="text-sm text-gray-600">Choose from 7 regional teams</p>
            </div>
          </div>
        </div>
      ),
      target: '#registration',
    },
    {
      id: 'features',
      title: 'Explore Features',
      description: 'Discover all the amazing features available on our platform.',
      content: (
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-white rounded-lg border">
            <Calendar className="w-6 h-6 text-cricket-blue mx-auto mb-2" />
            <h5 className="font-semibold text-sm">Live Matches</h5>
            <p className="text-xs text-gray-600">Real-time scores</p>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border">
            <Trophy className="w-6 h-6 text-cricket-gold mx-auto mb-2" />
            <h5 className="font-semibold text-sm">Statistics</h5>
            <p className="text-xs text-gray-600">Player stats</p>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border">
            <Users className="w-6 h-6 text-cricket-green mx-auto mb-2" />
            <h5 className="font-semibold text-sm">Teams</h5>
            <p className="text-xs text-gray-600">Team profiles</p>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border">
            <Star className="w-6 h-6 text-cricket-purple mx-auto mb-2" />
            <h5 className="font-semibold text-sm">News</h5>
            <p className="text-xs text-gray-600">Latest updates</p>
          </div>
        </div>
      ),
    },
    {
      id: 'get-started',
      title: 'Ready to Begin!',
      description: 'You\'re all set to explore the SSPL T10 experience.',
      content: (
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-energy rounded-full flex items-center justify-center mx-auto">
            <Play className="w-8 h-8 text-white" />
          </div>
          <h3 className="font-bold text-lg">Let's Get Started!</h3>
          <p className="text-sm text-gray-600">
            Explore teams, register as a player, and stay updated with the latest tournament news.
          </p>
          <div className="bg-gradient-primary text-white p-4 rounded-lg">
            <p className="text-sm font-semibold">🏆 Prize Money: ₹3 Crores</p>
            <p className="text-xs opacity-90">🏏 Finals at Sharjah Cricket Stadium</p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <EnhancedOnboarding
      steps={steps}
      onComplete={onComplete}
      onSkip={onSkip}
      autoStart={true}
      showProgress={true}
    />
  );
};

export const QuickStartGuide: React.FC<{
  onComplete: () => void;
}> = ({ onComplete }) => {
  const steps: OnboardingStep[] = [
    {
      id: 'search',
      title: 'Find What You Need',
      description: 'Use our powerful search to find teams, players, and matches.',
      content: (
        <div className="space-y-2">
          <p className="text-sm">🔍 Search for:</p>
          <ul className="text-sm space-y-1 ml-4">
            <li>• Team names (e.g., "Tamil Nadu")</li>
            <li>• Player names</li>
            <li>• Match schedules</li>
            <li>• Tournament news</li>
          </ul>
        </div>
      ),
      target: '[data-search]',
    },
    {
      id: 'register',
      title: 'Join the League',
      description: 'Register as a player and become part of the SSPL family.',
      content: (
        <div className="bg-gradient-accent text-white p-4 rounded-lg">
          <h4 className="font-bold mb-2">🎯 Registration Process:</h4>
          <ol className="text-sm space-y-1">
            <li>1. Fill personal details</li>
            <li>2. Choose your team</li>
            <li>3. Complete payment</li>
            <li>4. Get confirmation</li>
          </ol>
        </div>
      ),
      target: '#registration',
    },
  ];

  return (
    <EnhancedOnboarding
      steps={steps}
      onComplete={onComplete}
      autoStart={false}
      showProgress={false}
    />
  );
};

export default EnhancedOnboarding;