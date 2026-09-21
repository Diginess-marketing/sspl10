import { BlogPost } from "@/lib/blog-data";
import { cn } from "@/lib/utils";
import { ArrowRight, Calendar, Clock, User } from "lucide-react";
import { Link } from "wouter";

interface BlogCardProps {
  post: BlogPost;
  className?: string;
}

export function BlogCard({ post, className }: BlogCardProps) {
  return (
    <Link href={`/blog/${post.id}`}>
      <div
        className={cn(
          "group relative h-full overflow-hidden rounded-lg border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_20px_-5px_var(--color-primary)]",
          className
        )}
      >
        {/* Image Container with Slanted Overlay */}
        <div className="relative aspect-video overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent z-10" />
          <img
            src={post.image}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          
          {/* Category Badge */}
          <div className="absolute top-4 left-4 z-20">
            <span className="inline-block bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-[0_0_10px_var(--color-primary)] clip-path-slant">
              {post.category}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-20 flex flex-col gap-3 p-6">
          {/* Meta Info */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono">
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
          <h3 className="font-display text-xl font-bold leading-tight text-foreground transition-colors group-hover:text-primary">
            {post.title}
          </h3>

          {/* Excerpt */}
          <p className="line-clamp-2 text-sm text-muted-foreground font-body">
            {post.excerpt}
          </p>

          {/* Author & Read More */}
          <div className="mt-auto flex items-center justify-between pt-4">
            <div className="flex items-center gap-2 text-xs font-medium text-foreground/80">
              <User className="h-3 w-3 text-primary" />
              <span>{post.author}</span>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-primary transition-all group-hover:gap-2">
              Read Article
              <ArrowRight className="h-3 w-3" />
            </div>
          </div>
        </div>
        
        {/* Decorative Neon Line */}
        <div className="absolute bottom-0 left-0 h-1 w-0 bg-primary transition-all duration-300 group-hover:w-full" />
      </div>
    </Link>
  );
}
