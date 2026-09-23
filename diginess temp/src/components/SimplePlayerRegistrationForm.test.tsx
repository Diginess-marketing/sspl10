import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SimplePlayerRegistrationForm from './SimplePlayerRegistrationForm';
import { BrowserRouter } from 'react-router-dom';

// Mocks
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => vi.fn(),
    };
});

vi.mock('@/integrations/razorpayService', () => ({
    razorpayService: {
        getConfig: vi.fn().mockResolvedValue(null),
    },
}));

vi.mock('@/utils/utm', () => ({
    getUTMData: vi.fn().mockReturnValue({}),
}));

describe('SimplePlayerRegistrationForm', () => {
    it('renders the Team input field', () => {
        render(
            <BrowserRouter>
                <SimplePlayerRegistrationForm />
            </BrowserRouter>,
        );

        // Verify common fields exist
        expect(screen.getByLabelText(/Name:/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email:/i)).toBeInTheDocument();

        // Verify Team field is PRESENT
        // The label is "Team:"
        const teamInput = screen.getByLabelText(/Team:/i);
        expect(teamInput).toBeInTheDocument();
    });
});
