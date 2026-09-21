import React from 'react';

import { Phone, Mail, MessageCircle } from 'lucide-react';
import SEO from '@/components/SEO';
import { EnquiryForm } from '@/components/forms/EnquiryForm';
import { Box, Container, Typography, Grid, Card, useTheme, alpha } from '@mui/material';
import { InternalPageHero } from '@/components/layout/content/InternalPageHero';

const Enquiry = () => {
  const theme = useTheme();

  return (
    <>
      <SEO
        config={{
          title: 'Enquiry - SSPL T10 Cricket League',
          description: 'Get in touch for sponsorship or franchise enquiries for the Southern Street Premier League T10.',
          keywords: ['SSPL enquiry', 'sponsorship', 'franchise', 'contact SSPL', 'cricket league enquiries'],
          ogType: 'website',
          twitterCard: 'summary_large_image',
          robots: 'index, follow',
        }}
        canonical="https://ssplt10.com/enquiry"
      />

      {/* Force Light Theme Colors on Root Box */}
      <Box sx={{ bgcolor: '#f8fafc', color: '#0f172a', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

        {/* Main Content */}
        <Container maxWidth="lg" sx={{ py: 8, flexGrow: 1 }}>
          <Grid container spacing={8} alignItems="flex-start">

            {/* Visual / Info Side (Now on Left) */}
            <Grid item xs={12} lg={5}>
              <Box sx={{ position: 'sticky', top: 120 }}>
                <Box
                  component="img"
                  src="https://api.builder.io/api/v1/image/assets/TEMP/a9ee1e4f4a86f06d27b8ce169a5d9cadd5733f94?width=1272"
                  alt="Enquiry Visual"
                  sx={{ width: '100%', borderRadius: 4, boxShadow: theme.shadows[4], mb: 6 }}
                />

                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3, color: '#001b69 !important' }}>
                  Quick Contact
                </Typography>

                <Stack spacing={2}>
                  {/* Phone */}
                  <Card sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, '&:hover': { bgcolor: '#f1f5f9' }, bgcolor: '#ffffff' }}>
                    <Box sx={{ p: 1.5, bgcolor: alpha(theme.palette.brand.primary.main, 0.1), borderRadius: 2, color: 'brand.primary.main' }}>
                      <Phone size={24} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ color: '#4b5563 !important' }}>Call Now</Typography>
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#001b69 !important' }}>+91 88077 75960</Typography>
                    </Box>
                  </Card>

                  {/* Email */}
                  <Card sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, '&:hover': { bgcolor: '#f1f5f9' }, bgcolor: '#ffffff' }}>
                    <Box sx={{ p: 1.5, bgcolor: alpha(theme.palette.brand.primary.main, 0.1), borderRadius: 2, color: 'brand.primary.main' }}>
                      <Mail size={24} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ color: '#4b5563 !important' }}>Email Address</Typography>
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#001b69 !important' }}>customercare@ssplt10.co.in</Typography>
                    </Box>
                  </Card>

                  {/* WhatsApp */}
                  <Card 
                    sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, '&:hover': { bgcolor: '#f1f5f9' }, bgcolor: '#ffffff', cursor: 'pointer' }}
                    onClick={() => window.open('https://wa.me/918807775960', '_blank')}
                  >
                    <Box sx={{ p: 1.5, bgcolor: alpha(theme.palette.brand.primary.main, 0.1), borderRadius: 2, color: 'brand.primary.main' }}>
                      <MessageCircle size={24} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ color: '#4b5563 !important' }}>WhatsApp Support</Typography>
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#001b69 !important' }}>+91 88077 75960</Typography>
                    </Box>
                  </Card>
                </Stack>
              </Box>
            </Grid>

            {/* Form Side (Now on Right) */}
            <Grid item xs={12} lg={7}>
              <Card sx={{ p: { xs: 3, md: 5 }, borderRadius: 4, boxShadow: theme.shadows[10], position: 'relative', overflow: 'visible', bgcolor: '#ffffff' }}>
                <Box sx={{ mb: 4, textAlign: 'center' }}>
                  <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#001b69' }}>Send an Enquiry</Typography>
                  <Typography variant="body2" sx={{ color: '#4b5563' }}>Fill out the form below and our team will get back to you.</Typography>
                </Box>
                <EnquiryForm />
              </Card>
            </Grid>
          </Grid>
        </Container>


      </Box>
    </>
  );
};

// Helper for Stack - Need to import Stack
import { Stack } from '@mui/material';

export default Enquiry;