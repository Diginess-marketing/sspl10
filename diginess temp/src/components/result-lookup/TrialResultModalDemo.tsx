import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TrialResultModal from './TrialResultModal';
import PlayerResultCard from './PlayerResultCard';
import type { TrialResult } from '@/types/resultLookup';

// Mock data for demonstration
const demoResults: TrialResult[] = [
  {
    id: 'trial-001',
    name: 'Rahul Sharma',
    mobile: '9876543210',
    points: 85,
    selectionStatus: 'Selected',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z',
  },
  {
    id: 'trial-002',
    name: 'Priya Patel',
    mobile: '8765432109',
    points: 92,
    selectionStatus: 'Selected',
    created_at: '2024-01-15T11:15:00Z',
    updated_at: '2024-01-15T11:15:00Z',
  },
  {
    id: 'trial-003',
    name: 'Amit Kumar',
    mobile: '7654321098',
    points: 67,
    selectionStatus: 'Rejected',
    created_at: '2024-01-15T12:00:00Z',
    updated_at: '2024-01-15T12:00:00Z',
  },
  {
    id: 'trial-004',
    name: 'Sneha Reddy',
    mobile: '6543210987',
    points: 78,
    selectionStatus: 'Selected',
    created_at: '2024-01-15T13:45:00Z',
    updated_at: '2024-01-15T13:45:00Z',
  },
  {
    id: 'trial-005',
    name: 'Vikram Singh',
    mobile: '9876500000',
    points: 45,
    selectionStatus: 'Rejected',
    created_at: '2024-01-15T14:20:00Z',
    updated_at: '2024-01-15T14:20:00Z',
  },
];

const TrialResultModalDemo: React.FC = () => {
  const [selectedResult, setSelectedResult] = useState<TrialResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (result: TrialResult) => {
    setSelectedResult(result);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedResult(null);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Trial Result Modal Integration Demo
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            This demonstration shows how the TrialResultModal component integrates with existing 
            PlayerResultCard components. Click on any card to view detailed information in the modal.
          </p>
        </div>

        {/* Integration Example */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Integration with PlayerResultCard</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Click "View Details" on any player result card below to see the modal in action:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {demoResults.map((result) => (
                <Card key={result.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="mb-3">
                      <h3 className="font-semibold text-gray-900">{result.name}</h3>
                      <p className="text-sm text-gray-600">{result.mobile}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-lg font-bold text-purple-600">
                          {result.points} pts
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          result.selectionStatus === 'Selected' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {result.selectionStatus}
                        </span>
                      </div>
                    </div>
                    <Button
                      onClick={() => openModal(result)}
                      size="sm"
                      className="w-full"
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Existing PlayerResultCard Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Existing PlayerResultCard Examples</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {demoResults.slice(0, 2).map((result) => (
                <div key={result.id}>
                  <PlayerResultCard result={result} />
                  <div className="mt-4 text-center">
                    <Button
                      variant="outline"
                      onClick={() => openModal(result)}
                      className="text-sm"
                    >
                      Open Detailed Modal View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Trial Result Modal */}
        {selectedResult && (
          <TrialResultModal
            isOpen={isModalOpen}
            onClose={closeModal}
            result={selectedResult}
            showConfetti={true}
          />
        )}
      </div>
    </div>
  );
};

export default TrialResultModalDemo;