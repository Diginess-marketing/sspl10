import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import HeroSection from '../HeroSection';

// Mock the hooks and components
vi.mock('@/hooks/useWebsiteContent', () => ({
  useWebsiteContent: () => ({
    getContent: vi.fn(() => ({
      title: 'SSPL',
      tagline: '#gully2glory',
      stats: {
        prizeMoney: 'Prize Money: upto 3 Crores',
        playerPrize: 'Player Prize: upto 3 Lakhs',
        finalsAt: 'Finals At: Sharjah',
        franchisees: 'Teams: 12',
      },
    })),
    loading: false,
  }),
}));

vi.mock('../PlayerRegistrationForm', () => ({
  default: () => <div data-testid="player-registration-form">Player Registration Form</div>,
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, className }: { children: React.ReactNode; className?: string }) =>
    <span className={className} data-testid="badge">{children}</span>,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, className }: { children: React.ReactNode; onClick?: () => void; className?: string }) =>
    <button className={className} onClick={onClick} data-testid="button">{children}</button>,
}));

vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
    open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) =>
    <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) =>
    <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) =>
    <div data-testid="dialog-title">{children}</div>,
}));

describe('HeroSection', () => {
  it('renders the hero section with title and tagline', () => {
    render(<HeroSection />);

    expect(screen.getByText('Southern Street Premier League')).toBeInTheDocument();
    expect(screen.getByText('#gully2glory')).toBeInTheDocument();
    expect(screen.getByText('T10 TENNIS BALL CRICKET TOURNAMENT')).toBeInTheDocument();
  });

  it('renders stats cards', () => {
    render(<HeroSection />);

    expect(screen.getByText('upto 3 Crores')).toBeInTheDocument();
    expect(screen.getByText('upto 3 Lakhs')).toBeInTheDocument();
    expect(screen.getByText('Sharjah')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('opens registration modal when button is clicked', () => {
    render(<HeroSection />);

    const registrationButton = screen.getByText('Registrations Open Now');
    fireEvent.click(registrationButton);

    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByTestId('player-registration-form')).toBeInTheDocument();
  });

  it('renders the trials announcement card initially', () => {
    render(<HeroSection />);

    expect(screen.getByText('CHENNAI TRIALS')).toBeInTheDocument();
  });

  it('closes trials card when close button is clicked', () => {
    render(<HeroSection />);

    const closeButton = screen.getByLabelText('Close card');
    fireEvent.click(closeButton);

    expect(screen.queryByText('CHENNAI TRIALS')).not.toBeInTheDocument();
  });
});