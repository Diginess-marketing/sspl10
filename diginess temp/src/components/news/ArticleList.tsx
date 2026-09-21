import React from 'react';
import { Grid, Box, Typography, Button } from '@mui/material';
import { ArticleCard } from './ArticleCard';
import { BlogPost } from '@/data/blogs';
import { RefreshCw } from 'lucide-react';

interface ArticleListProps {
    articles: BlogPost[];
    loading?: boolean;
}

export const ArticleList = ({ articles, loading = false }: ArticleListProps) => {
    if (loading) {
        return (
            <Box sx={{ py: 8, textAlign: 'center' }}>
                <Typography>Loading content...</Typography>
            </Box>
        );
    }

    if (articles.length === 0) {
        return (
            <Box sx={{ py: 12, textAlign: 'center', bgcolor: 'background.paper', borderRadius: 2 }}>
                <RefreshCw size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                    No articles found
                </Typography>
                <Typography variant="body2" color="text.disabled">
                    Try adjusting your search or category filters.
                </Typography>
            </Box>
        );
    }

    // Check if we have a featured article (the first one)
    const featuredArticle = articles[0];
    const standardArticles = articles.slice(1);

    return (
        <Box>
            <Grid container spacing={4}>
                {/* Featured Article - Full Width on Tablet+ */}
                <Grid item xs={12}>
                    <ArticleCard article={featuredArticle} featured />
                </Grid>

                {/* Standard Articles Grid */}
                {standardArticles.map((article) => (
                    <Grid item xs={12} md={6} lg={4} key={article.id}>
                        <ArticleCard article={article} />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};
