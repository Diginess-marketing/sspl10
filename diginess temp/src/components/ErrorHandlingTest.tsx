import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import PlayerRegistrationForm from './PlayerRegistrationForm';

const ErrorHandlingTest = () => {
  const [testScenario, setTestScenario] = useState<string>('');
  const { toast } = useToast();

  const simulateNetworkError = () => {
    // Simulate network disconnection
    const originalFetch = window.fetch;
    window.fetch = () => Promise.reject(new Error('Failed to fetch'));

    setTimeout(() => {
      window.fetch = originalFetch;
      toast({
        title: 'Network Error Simulation',
        description: 'Network error simulation completed. Try submitting the form now.',
        variant: 'default',
      });
    }, 5000);

    toast({
      title: 'Network Error Simulated',
      description: 'Network connection disabled for 5 seconds.',
      variant: 'destructive',
    });
  };

  const simulateValidationError = () => {
    // This will be tested through the actual form validation
    toast({
      title: 'Validation Test',
      description: 'Try submitting the form with invalid data to test validation.',
      variant: 'default',
    });
  };

  const simulateDatabaseError = () => {
    // Instead of mocking, we'll just show instructions for manual testing
    toast({
      title: 'Database Error Test',
      description: 'To test database errors: temporarily disconnect from internet or stop Supabase service, then submit the form.',
      variant: 'default',
    });
  };

  const simulateComponentError = () => {
    // This will test the ErrorBoundary
    setTimeout(() => {
      throw new Error('Simulated component error for testing ErrorBoundary');
    }, 1000);

    toast({
      title: 'Component Error Scheduled',
      description: 'A component error will be thrown in 1 second to test ErrorBoundary.',
      variant: 'destructive',
    });
  };

  const testScenarios = [
    {
      id: 'network',
      title: 'Network Error',
      description: 'Simulate network disconnection during form submission',
      action: simulateNetworkError,
    },
    {
      id: 'validation',
      title: 'Validation Error',
      description: 'Test form validation with invalid data',
      action: simulateValidationError,
    },
    {
      id: 'database',
      title: 'Database Error',
      description: 'Simulate database connection issues',
      action: simulateDatabaseError,
    },
    {
      id: 'component',
      title: 'Component Error',
      description: 'Test ErrorBoundary with component crash',
      action: simulateComponentError,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Error Handling Test Suite</CardTitle>
          <p className="text-sm text-muted-foreground">
            Test the enhanced error handling in the Player Registration Form
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testScenarios.map((scenario) => (
              <Card key={scenario.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">{scenario.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {scenario.description}
                  </p>
                  <Button
                    onClick={scenario.action}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Run Test
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Test Results</h3>
            <div className="text-sm text-muted-foreground">
              <p>• Network errors should show offline indicator and disable submission</p>
              <p>• Validation errors should show specific field-level messages</p>
              <p>• Database errors should show user-friendly error messages</p>
              <p>• Component errors should be caught by ErrorBoundary</p>
              <p>• All errors should be logged to console for debugging</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="border-t pt-6">
        <h2 className="text-xl font-bold mb-4">Player Registration Form (With Error Handling)</h2>
        <PlayerRegistrationForm />
      </div>
    </div>
  );
};

export default ErrorHandlingTest;