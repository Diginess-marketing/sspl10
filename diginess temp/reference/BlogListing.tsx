import { BlogCard } from "@/components/BlogCard";
import { BlogLayout } from "@/components/BlogLayout";
import { blogPosts } from "@/lib/blog-data";
import { ArrowRight, Search } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

export default function BlogListing() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", ...Array.from(new Set(blogPosts.map((post) => post.category)))];

  const filteredPosts = blogPosts.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredPost = blogPosts[0];
  const remainingPosts = filteredPosts.filter(post => post.id !== featuredPost.id);

  return (
    <BlogLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="container relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 font-display text-5xl font-bold uppercase tracking-tighter text-foreground md:text-7xl">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                Inside The Game
              </span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground md:text-xl">
              Expert insights, training drills, and exclusive stories from the world of SSPLT10 tennis ball cricket.
            </p>
            
            {/* Search Bar */}
            <div className="relative mx-auto max-w-md">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-5 w-5 text-muted-foreground" />
              </div>
              <input
                type="text"
                className="block w-full rounded-full border border-border bg-card/50 py-3 pl-10 pr-4 text-foreground placeholder-muted-foreground backdrop-blur-sm focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Post (Only if no search/filter active) */}
      {searchQuery === "" && selectedCategory === "All" && (
        <section className="container mb-20">
          <div className="group relative overflow-hidden rounded-2xl border border-border bg-card">
            <div className="grid md:grid-cols-2">
              <div className="relative aspect-video md:aspect-auto overflow-hidden">
                <div className="absolute inset-0 bg-primary/10 mix-blend-overlay z-10" />
                <img 
                  src={featuredPost.image} 
                  alt={featuredPost.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-col justify-center p-8 md:p-12">
                <div className="mb-4 flex items-center gap-2">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                    Featured
                  </span>
                  <span className="text-xs text-muted-foreground">{featuredPost.date}</span>
                </div>
                <h2 className="mb-4 font-display text-3xl font-bold leading-tight md:text-4xl group-hover:text-primary transition-colors">
                  <Link href={`/blog/${featuredPost.id}`}>{featuredPost.title}</Link>
                </h2>
                <p className="mb-6 text-muted-foreground md:text-lg">
                  {featuredPost.excerpt}
                </p>
                <Link href={`/blog/${featuredPost.id}`}>
                  <button className="inline-flex items-center gap-2 font-bold uppercase tracking-wider text-primary transition-gap hover:gap-3">
                    Read Full Story <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Filter Categories */}
      <section className="container mb-12">
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-all",
                selectedCategory === category
                  ? "bg-primary text-primary-foreground shadow-[0_0_10px_var(--color-primary)]"
                  : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {/* Blog Grid */}
      <section className="container mb-24">
        {remainingPosts.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {remainingPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground">No articles found matching your criteria.</p>
            <button 
              onClick={() => {setSearchQuery(""); setSelectedCategory("All");}}
              className="mt-4 text-primary hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </section>
    </BlogLayout>
  );
}
