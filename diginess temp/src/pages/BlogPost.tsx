import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

import SEO from '@/components/SEO';
import { BlogCard } from '@/components/blog/BlogCard';
import { blogPosts } from '@/data/blogs';
import { OptimizedImage } from '@/components/OptimizedImage';
import { generateArticleSchema } from '@/utils/seoOptimization';
import { ArrowLeft, Calendar, Clock, User, Share2, Facebook, Twitter, Instagram } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import '@/styles/blog.css';

import { useToast } from '@/hooks/use-toast';

// ... (imports remain the same, just adding useToast)

const BlogPost: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const { toast } = useToast();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [slug]);

    const post = blogPosts.find((p) => p.id === slug);

    if (!post) {
        // ... (Not Found return remains the same)
        return (


            <main id="main-content" className="min-h-screen flex items-center justify-center">
                <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
                    <SEO config={{ title: 'Blog Not Found', description: 'Requested blog post was not found.' }} />
                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-12 shadow-xl">
                        <div className="text-6xl mb-6">📰</div>
                        <h1 className="text-3xl font-bold mb-4 text-gray-900 blog-title">
                            Article Not Found
                        </h1>
                        <p className="mb-8 text-gray-800 blog-body">
                            The article you're looking for doesn't exist or has been moved.
                        </p>
                        <Link
                            to="/articles-blogs"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all duration-300 transform hover:-translate-y-1 blog-gradient-button"
                        >
                            <span>←</span> Back to Articles & Blogs
                        </Link>
                    </div>
                </div>
            </main>


        );
    }

    const handleShare = (platform: string) => {
        const url = window.location.href;
        const text = `Check out this article: ${post.title}`;

        if (platform === 'facebook') {
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        } else if (platform === 'twitter') {
            window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
        } else if (platform === 'instagram') {
            navigator.clipboard.writeText(url);
            toast({
                title: 'Link Copied',
                description: 'Article link copied to clipboard for Instagram sharing!',
                duration: 3000,
            });
        }
    };

    const relatedPosts = blogPosts
        .filter((p) => p.category === post.category && p.id !== post.id)
        .slice(0, 3);

    return (
        <div className="min-h-screen bg-[#000d33] text-white">

            <SEO
                config={{
                    title: post.title,
                    description: post.excerpt,
                    canonical: `https://ssplt10.com/articles-blogs/${post.id}`,
                    ogType: 'article',
                    author: post.author,
                    publishedDate: post.date,
                    ogImage: post.image ? `${(import.meta.env.VITE_SITE_URL || 'https://ssplt10.co.in')}${post.image}` : undefined,
                }}
                schemas={[
                    generateArticleSchema({
                        headline: post.title,
                        description: post.excerpt,
                        image: post.image ? `${(import.meta.env.VITE_SITE_URL || 'https://ssplt10.co.in')}${post.image}` : undefined,
                        datePublished: post.date,
                        author: post.author,
                    }),
                ]}
            />

            {/* Progress Bar */}
            <div className="fixed top-0 left-0 z-60 h-1 w-full bg-gray-200">
                <div className="h-full w-1/3 blog-progress-bar" />
            </div>

            {/* Hero Header with VERY VISIBLE background image */}
            <header className="relative h-[60vh] min-h-[400px] w-full overflow-hidden">
                {/* Background image - fully visible */}
                <div className="absolute inset-0">
                    <OptimizedImage
                        src={post.image}
                        alt={post.title}
                        aspectRatio={16 / 9}
                        priority={true}
                        useOptimizedFallback={false}
                    />
                </div>
                {/* Very light gradient overlay - only at the very bottom for text */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10" />

                <div className="container mx-auto px-4 relative z-30 flex h-full flex-col justify-end pb-12 md:pb-20">
                    <Link to="/articles-blogs">
                        <button className="mb-6 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white drop-shadow-lg transition-colors hover:text-[#00FF7F] blog-back-button">
                            <ArrowLeft className="h-4 w-4" /> Back to Blog
                        </button>
                    </Link>

                    <div className="mb-4 flex flex-wrap items-center gap-4 text-sm font-medium">
                        <span className="rounded-full px-3 py-1 uppercase tracking-wider bg-[#00FF7F] text-black font-bold shadow-lg">
                            {post.category}
                        </span>
                        <span className="flex items-center gap-1 text-white drop-shadow-lg blog-meta">
                            <Clock className="h-4 w-4" /> {post.readTime}
                        </span>
                        <span className="flex items-center gap-1 text-white drop-shadow-lg blog-meta">
                            <Calendar className="h-4 w-4" /> {post.date}
                        </span>
                    </div>

                    <h1 className="max-w-4xl text-4xl font-bold leading-tight text-white md:text-6xl lg:text-7xl drop-shadow-2xl" style={{ fontFamily: "'Russo One', sans-serif", textShadow: '0 4px 20px rgba(0,0,0,0.8)' }}>
                        {post.title}
                    </h1>
                </div>
            </header>

            <div className="container mx-auto px-4 grid gap-12 py-12 lg:grid-cols-[1fr_300px]">
                {/* Main Content */}
                <article>
                    <div className="flex items-center gap-3 border-b border-gray-200 pb-8 mb-8">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#00FF7F]/20">
                            <User className="h-6 w-6 text-[#00A040]" />
                        </div>
                        <div>
                            <p className="font-bold text-white blog-meta">{post.author}</p>
                            <p className="text-sm !text-white/60 blog-meta">Author</p>
                        </div>
                    </div>

                    <div className="prose prose-lg max-w-none prose-invert prose-headings:font-bold prose-headings:text-white prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:pb-4 prose-h2:border-b prose-h2:border-[#00FF7F]/30 prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4 prose-p:text-white/90 prose-p:leading-relaxed prose-p:mb-6 prose-a:text-[#00FF7F] prose-a:no-underline prose-a:font-semibold hover:prose-a:text-white hover:prose-a:underline prose-strong:text-white prose-strong:font-bold prose-ul:text-white/90 prose-ul:my-6 prose-ol:text-white/90 prose-ol:my-6 prose-li:my-2 blog-body">
                        <ReactMarkdown>{post.content}</ReactMarkdown>
                    </div>
                </article>

                {/* Sidebar */}
                <aside className="space-y-8">
                    {/* Share Widget */}
                    <div className="sticky top-24 rounded-xl border border-white/10 bg-[#01144d] p-6">
                        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold !text-white blog-title">
                            <Share2 className="h-5 w-5 text-[#00A040]" /> Share Article
                        </h3>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleShare('facebook')}
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-600 transition-all hover:bg-[#1877F2] hover:text-white hover:scale-110"
                                aria-label="Share on Facebook"
                                title="Share on Facebook"
                            >
                                <Facebook className="h-5 w-5" />
                            </button>
                            <button
                                onClick={() => handleShare('twitter')}
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-600 transition-all hover:bg-[#1DA1F2] hover:text-white hover:scale-110"
                                aria-label="Share on Twitter"
                                title="Share on Twitter"
                            >
                                <Twitter className="h-5 w-5" />
                            </button>
                            <button
                                onClick={() => handleShare('instagram')}
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-600 transition-all hover:bg-pink-600 hover:text-white hover:scale-110"
                                aria-label="Share on Instagram"
                                title="Share on Instagram"
                            >
                                <Instagram className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="rounded-xl border border-white/10 bg-[#01144d] p-6">
                        <h3 className="mb-4 text-lg font-bold !text-white blog-title">
                            Tags
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {post.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="rounded-md bg-white/10 px-3 py-1 text-xs font-medium !text-white/90 transition-all cursor-pointer hover:bg-[#00FF7F] hover:text-black blog-meta"
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
                <section className="border-t border-white/10 py-20 bg-[#001b69]/30">
                    <div className="container mx-auto px-4">
                        <h2 className="mb-12 text-3xl font-bold !text-white blog-title">
                            Related Articles
                        </h2>
                        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            {relatedPosts.map((p) => (
                                <BlogCard key={p.id} post={p} />
                            ))}
                        </div>
                    </div>
                </section>
            )}


        </div>
    );
};

export default BlogPost;
