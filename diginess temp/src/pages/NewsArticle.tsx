import React from 'react';
import { useParams, Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import builtInNews from '@/data/news';
import { useCmsCollection } from '@/lib/cms/useCmsCollection';
import { generateArticleSchema } from '@/utils/seoOptimization';

const NewsArticlePage: React.FC = () => {
  const news = useCmsCollection('news', builtInNews);
  const { slug } = useParams<{ slug: string }>();
  const item = news.find((n) => n.slug === slug);

  if (!item) {
    return (
      <main id="main-content" className="container mx-auto px-4 py-8 max-w-3xl text-white">
        <SEO config={{ title: 'Article Not Found', description: 'Requested article was not found.' }} />
        <h1 className="text-2xl font-bold mb-2">Article not found</h1>
        <p className="mb-4">The news article you requested does not exist.</p>
        <Link to="/news" className="text-sport-orange underline">Back to News</Link>
      </main>
    );
  }

  return (
    <main id="main-content" className="container mx-auto px-4 py-8 max-w-3xl text-white">
      <SEO
        config={{
          title: item.title,
          description: item.excerpt,
          canonical: `https://ssplt10.com/news/${item.slug}`,
          ogType: 'article',
          author: item.author,
          publishedDate: item.publishedAt,
          ogImage: item.thumbnail ? `${(import.meta.env.VITE_SITE_URL || 'https://ssplt10.co.in')}${item.thumbnail}` : undefined,
        }}
        schemas={[
          generateArticleSchema({
            headline: item.title,
            description: item.excerpt,
            image: item.thumbnail ? `${(import.meta.env.VITE_SITE_URL || 'https://ssplt10.co.in')}${item.thumbnail}` : undefined,
            datePublished: item.publishedAt,
            author: item.author,
          }),
        ]}
      />
      <article>
        <header className="mb-6">
          <h1 className="text-3xl font-bold">{item.title}</h1>
          <div className="text-white/70 text-sm mt-2">
            {item.author} • {new Date(item.publishedAt).toLocaleDateString('en-IN')}
          </div>
          {item.thumbnail && (
            <img src={item.thumbnail} alt="" className="mt-4 rounded-lg" loading="lazy" />
          )}
        </header>
        <div className="prose prose-invert max-w-none">
          <p>{item.content}</p>
        </div>
      </article>
      <div className="mt-8">
        <Link to="/news" className="text-sport-orange underline">← Back to News</Link>
      </div>
    </main>
  );
};

export default NewsArticlePage;
