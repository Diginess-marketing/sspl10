import React from 'react';

interface MultistepFormWrapperProps {
    steps: React.ReactNode[];
    currentStep: number;
    setCurrentStep: (step: number) => void;
}

export const MultistepFormWrapper: React.FC<MultistepFormWrapperProps> = ({ steps, currentStep, setCurrentStep }) => {
    const total = steps.length;
    return (
        <div className="flex flex-col items-center">
            {/* Progress Indicator */}
            <div className="flex mb-6 space-x-2">
                {Array.from({ length: total }).map((_, i) => (
                    <div
                        key={i}
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${i === currentStep ? 'bg-cricket-blue text-white' : i < currentStep ? 'bg-cricket-blue/70 text-white' : 'bg-gray-200 text-gray-600'}`}
                    >
                        {i + 1}
                    </div>
                ))}
            </div>
            {/* Current Step Content */}
            <div className="w-full max-w-2xl">{steps[currentStep]}</div>
            {/* Navigation Buttons */}
            <div className="flex justify-between mt-4 w-full max-w-2xl">
                <button
                    type="button"
                    onClick={() => setCurrentStep(currentStep - 1)}
                    disabled={currentStep === 0}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded disabled:opacity-50"
                >
                    Back
                </button>
                <button
                    type="button"
                    onClick={() => setCurrentStep(currentStep + 1)}
                    disabled={currentStep === total - 1}
                    className="px-4 py-2 bg-cricket-blue text-white rounded disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </div>
    );
};
