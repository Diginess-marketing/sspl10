import { BlogCard } from "@/components/BlogCard";
import { BlogLayout } from "@/components/BlogLayout";
import { blogPosts } from "@/lib/blog-data";
import { ArrowLeft, Calendar, Clock, Facebook, Instagram, Linkedin, Share2, Twitter, User } from "lucide-react";
import { Link, useRoute } from "wouter";
import { Streamdown } from "streamdown";

export default function BlogPost() {
  const [, params] = useRoute("/blog/:id");
  const postId = params?.id;
  const post = blogPosts.find((p) => p.id === postId);

  if (!post) {
    return (
      <BlogLayout>
        <div className="container flex min-h-[60vh] flex-col items-center justify-center text-center">
          <h1 className="mb-4 font-display text-4xl font-bold">Article Not Found</h1>
          <p className="mb-8 text-muted-foreground">The article you are looking for does not exist.</p>
          <Link href="/blog">
            <button className="rounded-md bg-primary px-6 py-3 font-bold text-primary-foreground">
              Back to Blog
            </button>
          </Link>
        </div>
      </BlogLayout>
    );
  }

  const relatedPosts = blogPosts
    .filter((p) => p.category === post.category && p.id !== post.id)
    .slice(0, 3);

  return (
    <BlogLayout>
      {/* Progress Bar (Simulated) */}
      <div className="fixed top-0 left-0 z-[60] h-1 w-full bg-muted">
        <div className="h-full w-1/3 bg-primary" />
      </div>

      {/* Hero Header */}
      <header className="relative h-[60vh] min-h-[400px] w-full overflow-hidden">
        <div className="absolute inset-0 bg-background/80 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent z-20" />
        <img
          src={post.image}
          alt={post.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
        
        <div className="container relative z-30 flex h-full flex-col justify-end pb-12 md:pb-20">
          <Link href="/blog">
            <button className="mb-6 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground transition-colors hover:text-primary">
              <ArrowLeft className="h-4 w-4" /> Back to Blog
            </button>
          </Link>
          
          <div className="mb-4 flex flex-wrap items-center gap-4 text-sm font-medium text-primary">
            <span className="rounded-full bg-primary/10 px-3 py-1 uppercase tracking-wider shadow-[0_0_10px_var(--color-primary)]">
              {post.category}
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-4 w-4" /> {post.readTime}
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="h-4 w-4" /> {post.date}
            </span>
          </div>
          
          <h1 className="max-w-4xl font-display text-4xl font-bold leading-tight text-foreground md:text-6xl lg:text-7xl">
            {post.title}
          </h1>
        </div>
      </header>

      <div className="container grid gap-12 py-12 lg:grid-cols-[1fr_300px]">
        {/* Main Content */}
        <article className="prose prose-invert prose-lg max-w-none prose-headings:font-display prose-headings:font-bold prose-a:text-primary prose-img:rounded-xl">
          <div className="flex items-center gap-3 border-b border-border pb-8 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <User className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-bold text-foreground">{post.author}</p>
              <p className="text-sm text-muted-foreground">Author</p>
            </div>
          </div>

          <Streamdown className="text-muted-foreground">
            {post.content}
          </Streamdown>


        </article>

        {/* Sidebar */}
        <aside className="space-y-8">
          {/* Share Widget */}
          <div className="sticky top-24 rounded-xl border border-border bg-card p-6">
            <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-bold">
              <Share2 className="h-5 w-5 text-primary" /> Share Article
            </h3>
            <div className="flex gap-2">
              <button className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-[#1877F2] hover:text-white">
                <Facebook className="h-5 w-5" />
              </button>
              <button className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-[#1DA1F2] hover:text-white">
                <Twitter className="h-5 w-5" />
              </button>
              <button className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-[#0A66C2] hover:text-white">
                <Linkedin className="h-5 w-5" />
              </button>
              <button className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-pink-600 hover:text-white">
                <Instagram className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Tags */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="mb-4 font-display text-lg font-bold">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-muted px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground cursor-pointer"
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
        <section className="border-t border-border bg-muted/30 py-20">
          <div className="container">
            <h2 className="mb-12 font-display text-3xl font-bold">Related Articles</h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((p) => (
                <BlogCard key={p.id} post={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </BlogLayout>
  );
}
