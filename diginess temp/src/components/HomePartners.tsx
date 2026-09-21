import { Box, Container, Typography, Grid, Paper } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';

const PARTNERS = [
    { name: 'Commentary Box', src: '/Our-Sponsors/Comentary-Box.avif' },
    { name: 'Edge Media', src: '/Our-Sponsors/Edge-media.avif' },
    { name: 'Equitas Bank', src: '/Our-Sponsors/Equitas-Bank.avif' },
    { name: 'Football Makka', src: '/Our-Sponsors/Football-Makka.avif' },
    { name: 'I Merge', src: '/Our-Sponsors/I-Merge.avif' },
    { name: 'Lions International', src: '/Our-Sponsors/Lions-International-.avif' },
    { name: 'Malai Murasu', src: '/Our-Sponsors/Malai-Murasu.avif' },
    { name: 'Odi Vilayadu Papa', src: '/Our-Sponsors/Odi-Vilayadu-Papa.avif' },
    { name: 'Play O', src: '/Our-Sponsors/Play-O---Png.avif' },
    { name: 'Radio City', src: '/Our-Sponsors/Radio-city.avif' },
    { name: 'Reflect Media', src: '/Our-Sponsors/Reflect-Media.avif' },
    { name: 'Royal Peacocks', src: '/Our-Sponsors/Royal-Peacocks-.avif', isInitiative: true },
    { name: 'Sixit', src: '/Our-Sponsors/Sixit.avif' },
    { name: 'Turf Town', src: '/Our-Sponsors/Turf-Town-.avif' },

    { name: 'Zportify', src: '/images/zportify-logo.png' },
];

const HomePartners = () => {
    const theme = useTheme();
    const initiativePartner = PARTNERS.find(p => p.isInitiative);
    const otherPartners = PARTNERS.filter(p => !p.isInitiative);

    return (
        <Box sx={{ py: 10, bgcolor: 'background.default' }}>
            <Container maxWidth="xl">
                <Box textAlign="center" mb={8}>
                    <Typography variant="h2" color="brand.primary.main" gutterBottom>
                        OUR PARTNERS
                    </Typography>
                    <Typography variant="body1" sx={{ maxWidth: '600px', mx: 'auto', color: 'white !important' }}>
                        Proud to be associated with these esteemed organizations who share our vision.
                    </Typography>
                </Box>

                {/* Initiative By - Fixed to avoid 'undefined' error if not found */}
                {initiativePartner && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 8 }}>
                        <Typography
                            variant="subtitle2"
                            sx={{
                                color: 'brand.accent.dark',
                                fontWeight: 'bold',
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase',
                                mb: 2,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                '&::before, &::after': {
                                    content: '""',
                                    width: '40px',
                                    height: '1px',
                                    bgcolor: 'brand.accent.main',
                                    opacity: 0.5
                                }
                            }}
                        >
                            An Initiative By
                        </Typography>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 4,
                                borderRadius: 4,
                                bgcolor: '#fff',
                                border: `1px solid ${theme.palette.divider}`,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: `0 12px 24px ${alpha(theme.palette.brand.primary.main, 0.1)}`,
                                    borderColor: 'brand.accent.main'
                                }
                            }}
                        >
                            <img
                                src={initiativePartner.src}
                                alt={initiativePartner.name}
                                style={{ height: '80px', width: 'auto', objectFit: 'contain' }}
                            />
                        </Paper>
                    </Box>
                )}

                {/* Partners Grid */}
                <Grid container spacing={3} justifyContent="center" alignItems="center">
                    {otherPartners.map((partner, index) => (
                        <Grid item xs={6} sm={4} md={3} lg={2} key={index}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 2,
                                    height: '100px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: 2,
                                    bgcolor: '#fff',
                                    border: `1px solid ${theme.palette.grey[100]}`,
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        borderColor: 'brand.primary.main',
                                        boxShadow: theme.shadows[2],
                                        bgcolor: alpha(theme.palette.common.white, 1) // Ensure white bg
                                    }
                                }}
                            >
                                <img
                                    src={partner.src}
                                    alt={partner.name}
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '100%',
                                        objectFit: 'contain',
                                        filter: 'grayscale(100%)',
                                        opacity: 0.8,
                                        transition: 'all 0.3s ease'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.filter = 'grayscale(0%)';
                                        e.currentTarget.style.opacity = '1';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.filter = 'grayscale(100%)';
                                        e.currentTarget.style.opacity = '0.8';
                                    }}
                                />
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
};

export default HomePartners;
