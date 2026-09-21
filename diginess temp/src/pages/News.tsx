import React from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '@/components/SEO';
import { NewsCard } from '@/components/NewsCard';
import news from '@/data/news';
import { generateListItemSchema, generateWebPageSchema } from '@/utils/seoOptimization';

const NewsPage: React.FC = () => {
  const navigate = useNavigate();
  const sorted = [...news].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return (
    <main id="main-content" className="container mx-auto px-4 py-8 max-w-7xl">
      <SEO
        config={{
          title: 'SSPL T10 News',
          description: 'Latest news, announcements, and analysis from SSPL T10.',
          canonical: 'https://ssplt10.com/news',
          ogType: 'website',
        }}
        schemas={[
          generateWebPageSchema({
            name: 'SSPL T10 News',
            description: 'Latest news, announcements, and analysis from SSPL T10.',
            url: 'https://ssplt10.com/news',
          }),
          generateListItemSchema(
            sorted.map((item, index) => ({
              position: index + 1,
              name: item.title,
              url: `https://ssplt10.com/news/${item.slug}`,
              image: item.thumbnail
                ? `${(import.meta.env.VITE_SITE_URL || 'https://ssplt10.co.in')}${item.thumbnail}`
                : undefined,
            })),
          ),
        ]}
      />
      <h1 className="text-2xl font-bold text-sspl-navy mb-6">News</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sorted.map((item) => (
          <NewsCard
            key={item.id}
            title={item.title}
            excerpt={item.excerpt}
            thumbnail={item.thumbnail}
            author={item.author}
            publishedAt={item.publishedAt}
            category={item.category}
            tags={item.tags}
            onClick={() => navigate(`/news/${item.slug}`)}
            onReadMore={() => navigate(`/news/${item.slug}`)}
          />
        ))}
      </div>
    </main>
  );
};

export default NewsPage;
