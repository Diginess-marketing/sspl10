import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HeroSection from './HeroSection';

// Mock the useWebsiteContent hook
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

// Mock the hero image
vi.mock('/ravi mohan home with bg.png', () => ({
  default: 'mock-hero-image',
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>,
  );
};

describe('HeroSection', () => {
  it('renders the main heading', () => {
    renderWithRouter(<HeroSection />);

    expect(screen.getByText('Southern Street Premier League')).toBeInTheDocument();
  });

  it('renders the tagline', () => {
    renderWithRouter(<HeroSection />);

    expect(screen.getByText('#gully2glory')).toBeInTheDocument();
  });

  it('displays the register call to action', () => {
    renderWithRouter(<HeroSection />);

    expect(screen.getByText('Register Now')).toBeInTheDocument();
  });

  it('renders prize money stats', () => {
    renderWithRouter(<HeroSection />);

    expect(screen.getByText('upto 3 Crores')).toBeInTheDocument();
    expect(screen.getByText('upto 3 Lakhs')).toBeInTheDocument();
    expect(screen.getByText('Sharjah')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('shows the official notice banner', () => {
    renderWithRouter(<HeroSection />);

    expect(
      screen.getByText('Southern Street Premier League – Official Notice'),
    ).toBeInTheDocument();
  });

});