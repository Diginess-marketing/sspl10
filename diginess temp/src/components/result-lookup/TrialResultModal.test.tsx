import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TrialResultModal from './TrialResultModal';
import type { TrialResult } from '@/types/resultLookup';

// Mock the Confetti component
vi.mock('./Confetti', () => ({
  default: ({ isActive }: { isActive: boolean }) => 
    isActive ? <div data-testid="confetti">Confetti Animation</div> : null,
}));

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  User: ({ className, ...props }: any) => <div data-testid="user-icon" className={className} {...props} />,
  Phone: ({ className, ...props }: any) => <div data-testid="phone-icon" className={className} {...props} />,
  Target: ({ className, ...props }: any) => <div data-testid="target-icon" className={className} {...props} />,
  Trophy: ({ className, ...props }: any) => <div data-testid="trophy-icon" className={className} {...props} />,
  CheckCircle: ({ className, ...props }: any) => <div data-testid="check-icon" className={className} {...props} />,
  XCircle: ({ className, ...props }: any) => <div data-testid="x-icon" className={className} {...props} />,
  PartyPopper: ({ className, ...props }: any) => <div data-testid="party-icon" className={className} {...props} />,
  Calendar: ({ className, ...props }: any) => <div data-testid="calendar-icon" className={className} {...props} />,
  Clock: ({ className, ...props }: any) => <div data-testid="clock-icon" className={className} {...props} />,
  Star: ({ className, ...props }: any) => <div data-testid="star-icon" className={className} {...props} />,
  TrendingUp: ({ className, ...props }: any) => <div data-testid="trend-icon" className={className} {...props} />,
}));

// Sample test data
const mockSelectedResult: TrialResult = {
  id: '1',
  name: 'John Doe',
  mobile: '9876543210',
  points: 85,
  selectionStatus: 'Selected',
  created_at: '2024-01-01T10:00:00Z',
  updated_at: '2024-01-02T15:30:00Z',
};

const mockRejectedResult: TrialResult = {
  id: '2',
  name: 'Jane Smith',
  mobile: '9876543211',
  points: 65,
  selectionStatus: 'Rejected',
  created_at: '2024-01-01T10:00:00Z',
  updated_at: '2024-01-02T15:30:00Z',
};

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>,
  );
};

describe('TrialResultModal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('renders modal when open with selected player result', () => {
    renderWithRouter(
      <TrialResultModal
        isOpen={true}
        onClose={mockOnClose}
        result={mockSelectedResult}
        showConfetti={false}
      />
    );

    expect(screen.getByText('Trial Result Details')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('9876543210')).toBeInTheDocument();
    expect(screen.getByText('85')).toBeInTheDocument();
    expect(screen.getByText('Selected')).toBeInTheDocument();
  });

  it('renders modal when open with rejected player result', () => {
    renderWithRouter(
      <TrialResultModal
        isOpen={true}
        onClose={mockOnClose}
        result={mockRejectedResult}
        showConfetti={false}
      />
    );

    expect(screen.getByText('Trial Result Details')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('9876543211')).toBeInTheDocument();
    expect(screen.getByText('65')).toBeInTheDocument();
    expect(screen.getByText('Rejected')).toBeInTheDocument();
  });

  it('does not render when modal is closed', () => {
    renderWithRouter(
      <TrialResultModal
        isOpen={false}
        onClose={mockOnClose}
        result={mockSelectedResult}
        showConfetti={false}
      />
    );

    expect(screen.queryByText('Trial Result Details')).not.toBeInTheDocument();
  });

  it('shows confetti animation for selected players', async () => {
    renderWithRouter(
      <TrialResultModal
        isOpen={true}
        onClose={mockOnClose}
        result={mockSelectedResult}
        showConfetti={true}
      />
    );

    // The confetti component should be present when modal is open for selected player
    expect(screen.getByTestId('confetti')).toBeInTheDocument();
  });

  it('does not show confetti animation for rejected players', () => {
    renderWithRouter(
      <TrialResultModal
        isOpen={true}
        onClose={mockOnClose}
        result={mockRejectedResult}
        showConfetti={true}
      />
    );

    // Confetti should not be rendered for rejected players
    expect(screen.queryByTestId('confetti')).not.toBeInTheDocument();
  });

  it('displays player information correctly', () => {
    renderWithRouter(
      <TrialResultModal
        isOpen={true}
        onClose={mockOnClose}
        result={mockSelectedResult}
        showConfetti={false}
      />
    );

    expect(screen.getByText('Player Information')).toBeInTheDocument();
    expect(screen.getByText('Full Name')).toBeInTheDocument();
    expect(screen.getByText('Mobile Number')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('9876543210')).toBeInTheDocument();
  });

  it('displays performance metrics correctly', () => {
    renderWithRouter(
      <TrialResultModal
        isOpen={true}
        onClose={mockOnClose}
        result={mockSelectedResult}
        showConfetti={false}
      />
    );

    expect(screen.getByText('Performance Metrics')).toBeInTheDocument();
    expect(screen.getByText('Points Scored')).toBeInTheDocument();
    expect(screen.getByText('85')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('shows correct performance level badge for different point ranges', () => {
    const excellentResult = { ...mockSelectedResult, points: 95 };
    const goodResult = { ...mockSelectedResult, points: 75 };
    const averageResult = { ...mockSelectedResult, points: 55 };

    const { rerender } = renderWithRouter(
      <TrialResultModal
        isOpen={true}
        onClose={mockOnClose}
        result={excellentResult}
        showConfetti={false}
      />
    );

    // Should show "Excellent" for 95 points
    expect(screen.getByText('Excellent')).toBeInTheDocument();

    rerender(
      <TrialResultModal
        isOpen={true}
        onClose={mockOnClose}
        result={goodResult}
        showConfetti={false}
      />
    );

    // Should show "Good" for 75 points
    expect(screen.getByText('Good')).toBeInTheDocument();

    rerender(
      <TrialResultModal
        isOpen={true}
        onClose={mockOnClose}
        result={averageResult}
        showConfetti={false}
      />
    );

    // Should show "Average" for 55 points
    expect(screen.getByText('Average')).toBeInTheDocument();
  });

  it('displays timeline information correctly', () => {
    renderWithRouter(
      <TrialResultModal
        isOpen={true}
        onClose={mockOnClose}
        result={mockSelectedResult}
        showConfetti={false}
      />
    );

    expect(screen.getByText('Timeline Information')).toBeInTheDocument();
    expect(screen.getByText('Trial Registered')).toBeInTheDocument();
    expect(screen.getByText('Result Updated')).toBeInTheDocument();
  });

  it('displays selection status correctly', () => {
    renderWithRouter(
      <TrialResultModal
        isOpen={true}
        onClose={mockOnClose}
        result={mockSelectedResult}
        showConfetti={false}
      />
    );

    expect(screen.getByText('Selection Status')).toBeInTheDocument();
    expect(screen.getByText('Congratulations!')).toBeInTheDocument();
    expect(screen.getByText('You have been selected for the team! Welcome aboard!')).toBeInTheDocument();
  });

  it('displays rejection message for rejected players', () => {
    renderWithRouter(
      <TrialResultModal
        isOpen={true}
        onClose={mockOnClose}
        result={mockRejectedResult}
        showConfetti={false}
      />
    );

    expect(screen.getByText('Thank You')).toBeInTheDocument();
    expect(screen.getByText('Thank you for participating. Keep practicing and try again in the future.')).toBeInTheDocument();
  });

  it('has close button that calls onClose when clicked', () => {
    renderWithRouter(
      <TrialResultModal
        isOpen={true}
        onClose={mockOnClose}
        result={mockSelectedResult}
        showConfetti={false}
      />
    );

    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('shows "Next Steps" button for selected players', () => {
    renderWithRouter(
      <TrialResultModal
        isOpen={true}
        onClose={mockOnClose}
        result={mockSelectedResult}
        showConfetti={false}
      />
    );

    expect(screen.getByText('Next Steps')).toBeInTheDocument();
  });

  it('does not show "Next Steps" button for rejected players', () => {
    renderWithRouter(
      <TrialResultModal
        isOpen={true}
        onClose={mockOnClose}
        result={mockRejectedResult}
        showConfetti={false}
      />
    );

    expect(screen.queryByText('Next Steps')).not.toBeInTheDocument();
  });

  it('handles next steps button click for selected players', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    renderWithRouter(
      <TrialResultModal
        isOpen={true}
        onClose={mockOnClose}
        result={mockSelectedResult}
        showConfetti={false}
      />
    );

    const nextStepsButton = screen.getByText('Next Steps');
    fireEvent.click(nextStepsButton);

    expect(consoleSpy).toHaveBeenCalledWith('Selected player action');
    
    consoleSpy.mockRestore();
  });

  it('formats dates correctly in the timeline', () => {
    renderWithRouter(
      <TrialResultModal
        isOpen={true}
        onClose={mockOnClose}
        result={mockSelectedResult}
        showConfetti={false}
      />
    );

    // Check that dates are displayed (format may vary based on locale)
    const dateElements = screen.getAllByText(/January/i);
    expect(dateElements.length).toBeGreaterThan(0);
  });

  it('shows proper performance indicator with progress bar', () => {
    renderWithRouter(
      <TrialResultModal
        isOpen={true}
        onClose={mockOnClose}
        result={mockSelectedResult}
        showConfetti={false}
      />
    );

    expect(screen.getByText('Performance Level')).toBeInTheDocument();
    // Check that progress bar exists (it should show 85% width for 85 points)
    const progressContainer = screen.getByText('Performance Level').closest('.w-full.bg-gray-200.rounded-full.h-2');
    expect(progressContainer).toBeInTheDocument();
  });
});