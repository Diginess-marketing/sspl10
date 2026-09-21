import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Download, Heart, Star, Settings, Loader2 } from 'lucide-react';

const ButtonShowcase = () => {
  const [loadingStates, setLoadingStates] = useState({
    primary: false,
    secondary: false,
    icon: false,
  });

  const handleLoadingClick = (buttonType: keyof typeof loadingStates) => {
    setLoadingStates(prev => ({ ...prev, [buttonType]: true }));
    setTimeout(() => {
      setLoadingStates(prev => ({ ...prev, [buttonType]: false }));
    }, 2000);
  };

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-sport-green">
          Enhanced Button System Showcase
        </h1>

        {/* Primary & Secondary Buttons */}
        <section className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Primary & Secondary Buttons</h2>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4 items-center">
              <Button variant="primary" size="sm">Small Primary</Button>
              <Button variant="primary">Default Primary</Button>
              <Button variant="primary" size="lg">Large Primary</Button>
              <Button variant="primary" size="xl">XL Primary</Button>
            </div>

            <div className="flex flex-wrap gap-4 items-center">
              <Button variant="secondary" size="sm">Small Secondary</Button>
              <Button variant="secondary">Default Secondary</Button>
              <Button variant="secondary" size="lg">Large Secondary</Button>
              <Button variant="secondary" size="xl">XL Secondary</Button>
            </div>

            <div className="flex flex-wrap gap-4 items-center">
              <Button variant="primary" fullWidth>Full Width Primary</Button>
            </div>
          </div>
        </section>

        {/* Loading States */}
        <section className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Loading States</h2>
          <div className="flex flex-wrap gap-4 items-center">
            <Button
              variant="primary"
              loading={loadingStates.primary}
              onClick={() => handleLoadingClick('primary')}
            >
              {loadingStates.primary ? 'Loading...' : 'Click to Load'}
            </Button>

            <Button
              variant="secondary"
              loading={loadingStates.secondary}
              onClick={() => handleLoadingClick('secondary')}
            >
              {loadingStates.secondary ? 'Loading...' : 'Secondary Loading'}
            </Button>
          </div>
        </section>

        {/* Icon Buttons */}
        <section className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Icon Buttons</h2>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4 items-center">
              <Button variant="primary" size="sm" leftIcon={<Play className="w-3 h-3" />}>
                Play Video
              </Button>
              <Button variant="primary" leftIcon={<Download className="w-4 h-4" />}>
                Download
              </Button>
              <Button variant="primary" rightIcon={<Heart className="w-4 h-4" />}>
                Add to Favorites
              </Button>
            </div>

            <div className="flex flex-wrap gap-4 items-center">
              <Button variant="secondary" size="icon" aria-label="Play">
                <Play className="w-4 h-4" />
              </Button>
              <Button variant="secondary" size="icon" aria-label="Download">
                <Download className="w-4 h-4" />
              </Button>
              <Button variant="secondary" size="icon" aria-label="Settings">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* Legacy Variants (Backward Compatibility) */}
        <section className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Legacy Variants (Backward Compatible)</h2>
          <div className="flex flex-wrap gap-4 items-center">
            <Button variant="default">Default</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </div>
        </section>

        {/* Special Variants */}
        <section className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Special Variants</h2>
          <div className="flex flex-wrap gap-4 items-center">
            <Button variant="premium">Premium</Button>
            <Button variant="hero">Hero</Button>
            <Button variant="success">Success</Button>
            <Button variant="magical">Magical</Button>
          </div>
        </section>

        {/* Disabled States */}
        <section className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Disabled States</h2>
          <div className="flex flex-wrap gap-4 items-center">
            <Button variant="primary" disabled>
              Disabled Primary
            </Button>
            <Button variant="secondary" disabled>
              Disabled Secondary
            </Button>
            <Button variant="default" disabled>
              Disabled Default
            </Button>
          </div>
        </section>

        {/* Responsive Full Width */}
        <section className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Responsive Full Width</h2>
          <div className="space-y-4">
            <Button variant="primary" fullWidth className="max-w-md">
              Responsive Button (Full width on mobile)
            </Button>
            <Button variant="secondary" fullWidth className="max-w-md">
              Another Responsive Button
            </Button>
          </div>
        </section>

        {/* Accessibility Features */}
        <section className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Accessibility Features</h2>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              All buttons include proper ARIA labels, keyboard navigation, focus management, and screen reader support.
            </p>
            <div className="flex flex-wrap gap-4 items-center">
              <Button
                variant="primary"
                aria-label="Submit form with primary action"
                onClick={() => alert('Primary action triggered!')}
              >
                Accessible Primary
              </Button>
              <Button
                variant="secondary"
                aria-label="Cancel current operation"
                onClick={() => alert('Secondary action triggered!')}
              >
                Accessible Secondary
              </Button>
            </div>
          </div>
        </section>

        {/* Performance Optimized */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Performance Features</h2>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Buttons include GPU acceleration, optimized transitions, and reduced motion support.
            </p>
            <div className="flex flex-wrap gap-4 items-center">
              <Button variant="primary" className="hover-gpu">
                GPU Accelerated
              </Button>
              <Button variant="secondary" className="transition-gpu">
                Smooth Transitions
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ButtonShowcase;