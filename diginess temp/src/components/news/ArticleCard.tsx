import {
    Card,
    CardContent,
    CardMedia,
    Typography,
    Box,
    Chip,
    Button,
    Stack,
    useTheme,
} from '@mui/material';
import { Calendar, Clock, ArrowRight, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BlogPost } from '@/data/blogs';

interface ArticleCardProps {
    article: BlogPost;
    featured?: boolean;
}

export const ArticleCard = ({ article, featured = false }: ArticleCardProps) => {
    const theme = useTheme();

    return (
        <Card
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                    '& .article-title': {
                        color: 'brand.accent.main',
                    },
                    '& .article-image': {
                        transform: 'scale(1.05)',
                    },
                },
            }}
        >
            <Box sx={{ position: 'relative', overflow: 'hidden', height: featured ? 320 : 220 }}>
                <CardMedia
                    component="img"
                    image={article.image || '/images/insta-tactics.jpg'}
                    alt={article.title}
                    className="article-image"
                    sx={{
                        height: '100%',
                        width: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.5s ease',
                    }}
                />
                {/* Category Badge */}
                <Chip
                    label={article.category}
                    size="small"
                    sx={{
                        position: 'absolute',
                        top: 16,
                        left: 16,
                        bgcolor: 'brand.primary.main',
                        color: 'common.white',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        borderRadius: 0,
                        borderBottomRightRadius: 8,
                    }}
                />

                {/* Featured Tag */}
                {featured && (
                    <Chip
                        label="Featured Story"
                        color="secondary"
                        size="small"
                        sx={{
                            position: 'absolute',
                            top: 16,
                            right: 16,
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                        }}
                    />
                )}
            </Box>

            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
                {/* Meta Info */}
                <Stack direction="row" spacing={2} sx={{ mb: 2, color: 'text.secondary', fontSize: '0.75rem' }} alignItems="center">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Calendar size={14} />
                        {article.date}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Clock size={14} />
                        {article.readTime}
                    </Box>
                </Stack>

                <Typography
                    variant={featured ? 'h4' : 'h6'}
                    className="article-title"
                    sx={{
                        mb: 2,
                        fontWeight: 'bold',
                        lineHeight: 1.2,
                        transition: 'color 0.2s ease',
                        fontFamily: featured ? 'heading' : 'subheading',
                        textTransform: featured ? 'uppercase' : 'none',
                    }}
                >
                    {article.title}
                </Typography>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        mb: 3,
                        display: '-webkit-box',
                        WebkitLineClamp: featured ? 4 : 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        flexGrow: 1,
                    }}
                >
                    {article.excerpt}
                </Typography>

                <Stack direction="row" justifyContent="space-between" alignItems="center" mt="auto">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: '0.75rem', fontWeight: 600, color: 'text.primary' }}>
                        <User size={14} color={theme.palette.brand.accent.dark} />
                        {article.author}
                    </Box>

                    <Button
                        component={Link}
                        to={`/articles-blogs/${article.id}`}
                        endIcon={<ArrowRight size={16} />}
                        sx={{
                            textTransform: 'none',
                            fontWeight: 'bold',
                            color: 'brand.primary.main',
                            '&:hover': { bgcolor: 'transparent', color: 'brand.accent.main' },
                            p: 0,
                            minWidth: 'auto',
                        }}
                        disableRipple
                    >
                        Read Article
                    </Button>
                </Stack>
            </CardContent>
        </Card>
    );
};
