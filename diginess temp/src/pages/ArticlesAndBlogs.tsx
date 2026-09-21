import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import SEO from '@/components/SEO';
import { BlogCard } from '@/components/blog/BlogCard';
import { blogPosts } from '@/data/blogs';
import { OptimizedImage } from '@/components/OptimizedImage';
import { generateListItemSchema, generateWebPageSchema } from '@/utils/seoOptimization';
import { Search, ArrowRight } from 'lucide-react';
import '@/styles/blog.css';

const ArticlesAndBlogs: React.FC = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const categories = ['All', ...Array.from(new Set(blogPosts.map((post) => post.category)))];

    const filteredPosts = blogPosts.filter((post) => {
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const featuredPost = blogPosts[0];
    const remainingPosts = filteredPosts.filter(post => post.id !== featuredPost.id);

    return (
        <div className="min-h-screen bg-[#000d33] text-white">

            <SEO
                config={{
                    title: 'Articles & Blogs - SSPL T10',
                    description: 'Expert insights, training drills, and exclusive stories from the world of SSPLT10 tennis ball cricket.',
                    canonical: 'https://ssplt10.com/articles-blogs',
                    ogType: 'website',
                }}
                schemas={[
                    generateWebPageSchema({
                        name: 'Articles & Blogs - SSPL T10',
                        description: 'Expert insights, training drills, and exclusive stories from the world of SSPLT10 tennis ball cricket.',
                        url: 'https://ssplt10.com/articles-blogs',
                    }),
                    generateListItemSchema(
                        blogPosts.map((item, index) => ({
                            position: index + 1,
                            name: item.title,
                            url: `https://ssplt10.com/articles-blogs/${item.id}`,
                            image: item.image
                                ? `${(import.meta.env.VITE_SITE_URL || 'https://ssplt10.co.in')}${item.image}`
                                : undefined,
                        })),
                    ),
                ]}
            />

            {/* Hero Section - Compact */}
            <section className="relative overflow-hidden py-12 md:py-16 bg-[#001b69]">
                <div className="container relative z-10 mx-auto px-4">
                    <div className="mx-auto max-w-3xl text-center">
                        <h1
                            className="mb-4 text-4xl font-bold uppercase tracking-tighter md:text-6xl text-white"
                            style={{ fontFamily: "'Russo One', sans-serif" }}
                        >
                            Inside The Game
                        </h1>
                        <p
                            className="mb-6 text-base !text-white/80 md:text-lg"
                            style={{ fontFamily: "'IBM Plex Sans Condensed', 'Roboto Condensed', sans-serif" }}
                        >
                            Expert insights, training drills, and exclusive stories from the world of SSPLT10 tennis ball cricket.
                        </p>

                        {/* Search Bar */}
                        <div className="relative mx-auto max-w-md">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <Search className="h-5 w-5 text-gray-500" />
                            </div>
                            <input
                                type="text"
                                className="block w-full rounded-full border border-gray-300 bg-white py-3 pl-10 pr-4 text-gray-900 placeholder-gray-500 focus:border-[#00FF7F] focus:ring-1 focus:ring-[#00FF7F] focus:outline-none transition-all shadow-sm"
                                placeholder="Search articles..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ fontFamily: "'IBM Plex Sans Condensed', 'Roboto Condensed', sans-serif" }}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Post (Only if no search/filter active) - Brought Closer */}
            {searchQuery === '' && selectedCategory === 'All' && (
                <section className="container mx-auto px-4 mb-16 -mt-8">
                    <div
                        className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#01144d] cursor-pointer shadow-xl hover:shadow-2xl transition-shadow duration-300"
                        onClick={() => navigate(`/articles-blogs/${featuredPost.id}`)}
                    >
                        <div className="grid md:grid-cols-2">
                            <div className="relative aspect-video md:aspect-auto overflow-hidden">
                                <div
                                    className="absolute inset-0 z-10"
                                    style={{
                                        background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.9) 100%)',
                                    }}
                                />
                                <OptimizedImage
                                    src={featuredPost.image}
                                    alt={featuredPost.title}
                                    aspectRatio="video"
                                    className="transition-transform duration-700 group-hover:scale-105"
                                    priority={true}
                                    useOptimizedFallback={false}
                                />
                            </div>
                            <div className="flex flex-col justify-center p-8 md:p-12">
                                <div className="mb-4 flex items-center gap-2">
                                    <span
                                        className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider"
                                        style={{
                                            background: 'rgba(0, 255, 127, 0.1)',
                                            color: '#00FF7F',
                                            fontFamily: "'Russo One', sans-serif",
                                        }}
                                    >
                                        Featured
                                    </span>
                                    <span
                                        className="text-xs text-gray-500"
                                        style={{ fontFamily: "'IBM Plex Sans Condensed', 'Roboto Condensed', sans-serif" }}
                                    >
                                        {featuredPost.date}
                                    </span>
                                </div>
                                <h2
                                    className="mb-4 text-3xl font-bold leading-tight md:text-4xl text-white group-hover:text-[#00FF7F] transition-colors"
                                    style={{ fontFamily: "'Russo One', sans-serif" }}
                                >
                                    {featuredPost.title}
                                </h2>
                                <p
                                    className="mb-6 !text-white/80 md:text-lg"
                                    style={{ fontFamily: "'IBM Plex Sans Condensed', 'Roboto Condensed', sans-serif" }}
                                >
                                    {featuredPost.excerpt}
                                </p>
                                <button
                                    className="inline-flex items-center gap-2 font-bold uppercase tracking-wider transition-gap hover:gap-3"
                                    style={{
                                        color: '#00FF7F',
                                        fontFamily: "'Russo One', sans-serif",
                                    }}
                                >
                                    Read Full Story <ArrowRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Filter Categories */}
            <section className="container mx-auto px-4 mb-12">
                <div className="flex flex-wrap justify-center gap-2">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${selectedCategory === category
                                ? 'text-black'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900'
                                }`}
                            style={{
                                ...(selectedCategory === category && {
                                    background: '#00FF7F',
                                    boxShadow: '0 0 10px #00FF7F',
                                }),
                                fontFamily: "'IBM Plex Sans Condensed', 'Roboto Condensed', sans-serif",
                                fontWeight: 600,
                            }}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </section>

            {/* Blog Grid */}
            <section className="container mx-auto px-4 mb-24">
                {remainingPosts.length > 0 ? (
                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {remainingPosts.map((post) => (
                            <BlogCard key={post.id} post={post} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p
                            className="text-xl !text-white/70"
                            style={{ fontFamily: "'IBM Plex Sans Condensed', 'Roboto Condensed', sans-serif" }}
                        >
                            No articles found matching your criteria.
                        </p>
                        <button
                            onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                            className="mt-4 hover:underline"
                            style={{
                                color: '#00A040',
                                fontFamily: "'Russo One', sans-serif",
                            }}
                        >
                            Clear filters
                        </button>
                    </div>
                )}
            </section>


        </div>
    );
};

export default ArticlesAndBlogs;
