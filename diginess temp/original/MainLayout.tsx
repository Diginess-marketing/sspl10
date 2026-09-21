import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import Header from '../Header';
import Footer from '../FooterSection';

/**
 * Main Layout component that wraps pages with Header and Footer
 * Uses Outlet for nested routing
 */
export const Layout: React.FC = () => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            <Box
                component="main"
                id="main-content"
                sx={{
                    flex: 1,
                    pt: { xs: '70px', md: '75px' },
                }}
            >
                <Outlet />
            </Box>
            <Footer />
        </Box>
    );
};

export default Layout;
