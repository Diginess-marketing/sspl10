import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { BlogCard } from '@/components/blog/BlogCard';
import { blogPosts } from '@/data/blogs';

const BlogPreviewSection = () => {
    // Get the latest 3 posts
    const latestPosts = blogPosts.slice(0, 3);

    return (

        <section className="py-24 md:py-32 relative overflow-hidden bg-[#0A1628]">

            <div className="container mx-auto px-4 relative z-10">
                {/* Section Header */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6">
                    <div className="max-w-2xl">
                        <h2
                            className="text-4xl md:text-5xl font-bold uppercase tracking-tighter mb-3 text-white font-heading"
                        >
                            Latest <span className="text-[#00B4D8]">Updates</span>
                        </h2>
                        <p className="text-lg !text-white font-medium">
                            Stay updated with the latest news, announcements, and stories from the SSPL.
                        </p>
                    </div>

                    <Link
                        to="/articles-blogs"
                        className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#00B4D8] to-[#0072ff] text-white rounded-full shadow-lg hover:shadow-[#00B4D8]/20 transition-all font-bold uppercase tracking-wider text-sm"
                    >
                        <span>View All Articles</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* Blog Grid */}
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {latestPosts.map((post) => (
                        <BlogCard key={post.id} post={post} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default BlogPreviewSection;
