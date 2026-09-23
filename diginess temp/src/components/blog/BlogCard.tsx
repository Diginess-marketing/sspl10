import { useNavigate } from 'react-router-dom';
import { BlogPost } from '@/data/blogs';
import { Calendar, Clock, User, ArrowRight } from 'lucide-react';
import { OptimizedImage } from '@/components/OptimizedImage';
import '@/styles/blog.css';

interface BlogCardProps {
    post: BlogPost;
    className?: string;
}

export function BlogCard({ post, className = '' }: BlogCardProps) {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(`/articles-blogs/${post.id}`)}
            className={`group relative h-full overflow-hidden rounded-lg border border-white/10 bg-[#001b69] transition-all duration-300 hover:-translate-y-1 cursor-pointer blog-card shadow-md hover:shadow-xl ${className}`}
        >
            {/* Image Container with Gradient Overlay */}
            <div className="relative aspect-square sm:aspect-video overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10" />
                <OptimizedImage
                    src={post.image}
                    alt={post.title}
                    aspectRatio="video"
                    className="transition-transform duration-500 group-hover:scale-110"
                    priority={false}
                    useOptimizedFallback={false}
                />

                {/* Category Badge with Slant */}
                <div className="absolute top-4 left-4 z-20">
                    <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider text-black clip-path-slant blog-card-category">
                        {post.category}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="relative z-20 flex flex-col gap-3 p-6">
                {/* Meta Info */}
                <div className="flex items-center gap-4 text-xs !text-white/70 blog-meta">
                    <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{post.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{post.readTime}</span>
                    </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold leading-tight text-white transition-colors group-hover:text-[#00FF7F] blog-card-title">
                    {post.title}
                </h3>

                {/* Excerpt */}
                <p className="line-clamp-2 text-sm !text-white/80 blog-card-excerpt">
                    {post.excerpt}
                </p>

                {/* Author & Read More */}
                <div className="mt-auto flex items-center justify-between pt-4">
                    <div className="flex items-center gap-2 text-xs font-medium !text-white/70">
                        <User className="h-3 w-3 text-[#00FF7F]" />
                        <span className="blog-meta">{post.author}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#00FF7F] transition-all group-hover:gap-2 blog-card-read-more">
                        Read Article
                        <ArrowRight className="h-3 w-3" />
                    </div>
                </div>
            </div>

            {/* Decorative Neon Line */}
            <div className="absolute bottom-0 left-0 h-1 w-0 transition-all duration-300 group-hover:w-full blog-card-neon-line" />
        </div>
    );
}
