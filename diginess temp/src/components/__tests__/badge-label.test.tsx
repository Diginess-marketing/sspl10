import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi, describe, test, expect } from 'vitest';
import { Badge, LiveBadge, NumericBadge } from '@/components/ui/badge';
import { Label, CategoryLabel, TagLabel, StatusLabel, PriorityLabel } from '@/components/ui/label';

// Mock the utils function
vi.mock('@/lib/utils', () => ({
  cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' '),
}));

describe('Badge Components', () => {
  test('renders basic badge', () => {
    render(<Badge>Basic Badge</Badge>);
    expect(screen.getByText('Basic Badge')).toBeInTheDocument();
  });

  test('renders live badge', () => {
    render(<Badge variant="live">Live</Badge>);
    const badge = screen.getByText('Live');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-sport-orange');
  });

  test('renders upcoming badge', () => {
    render(<Badge variant="upcoming">Upcoming</Badge>);
    const badge = screen.getByText('Upcoming');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-sport-teal');
  });

  test('renders completed badge', () => {
    render(<Badge variant="completed">Completed</Badge>);
    const badge = screen.getByText('Completed');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-gray-500');
  });

  test('renders different sizes', () => {
    render(
      <div>
        <Badge size="xs">XS</Badge>
        <Badge size="sm">SM</Badge>
        <Badge size="default">Default</Badge>
        <Badge size="lg">LG</Badge>
      </div>,
    );
    expect(screen.getByText('XS')).toBeInTheDocument();
    expect(screen.getByText('SM')).toBeInTheDocument();
    expect(screen.getByText('Default')).toBeInTheDocument();
    expect(screen.getByText('LG')).toBeInTheDocument();
  });

  test('renders animated live badge', () => {
    render(<Badge variant="live" animated>Animated Live</Badge>);
    const badge = screen.getByText('Animated Live');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('animate-pulse-glow');
  });

  test('renders LiveBadge component', () => {
    render(<LiveBadge>Live Component</LiveBadge>);
    const badge = screen.getByText('Live Component');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-sport-orange');
  });

  test('renders numeric badges', () => {
    render(
      <div>
        <NumericBadge count={0} />
        <NumericBadge count={5} />
        <NumericBadge count={99} />
        <NumericBadge count={150} maxCount={99} />
      </div>,
    );
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('99')).toBeInTheDocument();
    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  test('renders badge with dot indicator', () => {
    render(<Badge variant="info" showDot>Messages</Badge>);
    expect(screen.getByText('Messages')).toBeInTheDocument();
  });
});

describe('Label Components', () => {
  test('renders basic label', () => {
    render(<Label>Basic Label</Label>);
    expect(screen.getByText('Basic Label')).toBeInTheDocument();
  });

  test('renders category label', () => {
    render(<CategoryLabel>Category</CategoryLabel>);
    const label = screen.getByText('Category');
    expect(label).toBeInTheDocument();
    expect(label).toHaveClass('bg-sport-blue/10');
  });

  test('renders tag label', () => {
    render(<TagLabel>Tag</TagLabel>);
    const label = screen.getByText('Tag');
    expect(label).toBeInTheDocument();
    expect(label).toHaveClass('bg-gray-100');
  });

  test('renders status label', () => {
    render(<StatusLabel>Status</StatusLabel>);
    const label = screen.getByText('Status');
    expect(label).toBeInTheDocument();
    expect(label).toHaveClass('rounded-full');
  });

  test('renders priority label', () => {
    render(<PriorityLabel>Priority</PriorityLabel>);
    const label = screen.getByText('Priority');
    expect(label).toBeInTheDocument();
    expect(label).toHaveClass('rounded-full');
  });

  test('renders label with icons', () => {
    render(
      <div>
        <Label startIcon={<span>🏷️</span>}>With Start Icon</Label>
        <Label endIcon={<span>→</span>}>With End Icon</Label>
      </div>,
    );
    expect(screen.getByText('With Start Icon')).toBeInTheDocument();
    expect(screen.getByText('With End Icon')).toBeInTheDocument();
  });

  test('renders removable label', () => {
    const handleRemove = vi.fn();
    render(
      <TagLabel removable onRemove={handleRemove}>
        Removable Tag
      </TagLabel>,
    );
    const label = screen.getByText('Removable Tag');
    expect(label).toBeInTheDocument();

    const removeButton = screen.getByRole('button', { name: 'Remove label' });
    expect(removeButton).toBeInTheDocument();
  });

  test('renders different label variants', () => {
    render(
      <div>
        <Label variant="category-sports">Sports Category</Label>
        <Label variant="tag-primary">Primary Tag</Label>
        <Label variant="status-active">Active Status</Label>
        <Label variant="priority-high">High Priority</Label>
      </div>,
    );
    expect(screen.getByText('Sports Category')).toBeInTheDocument();
    expect(screen.getByText('Primary Tag')).toBeInTheDocument();
    expect(screen.getByText('Active Status')).toBeInTheDocument();
    expect(screen.getByText('High Priority')).toBeInTheDocument();
  });
});

describe('Accessibility', () => {
  test('badge has proper ARIA labels', () => {
    render(<Badge variant="live">Live Content</Badge>);
    const badge = screen.getByText('Live Content');
    expect(badge).toHaveAttribute('aria-label', 'Live content');
  });

  test('numeric badge has proper ARIA labels', () => {
    render(<NumericBadge count={5} />);
    const badge = screen.getByText('5');
    expect(badge).toHaveAttribute('aria-label', '5 notifications');
  });

  test('status badge has proper role', () => {
    render(<Badge variant="live">Live</Badge>);
    const badge = screen.getByText('Live');
    expect(badge).toHaveAttribute('role', 'status');
  });
});