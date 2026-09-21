import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface BlogLayoutProps {
  children: ReactNode;
}

export function BlogLayout({ children }: BlogLayoutProps) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-background font-body text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 font-display text-2xl font-bold tracking-tighter">
              <span className="text-primary">SSPL</span>
              <span className="text-foreground">T10</span>
            </div>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/">
              <span className={cn("transition-colors hover:text-primary", location === "/" ? "text-primary" : "text-muted-foreground")}>
                Home
              </span>
            </Link>
            <Link href="/blog">
              <span className={cn("transition-colors hover:text-primary", location.startsWith("/blog") ? "text-primary" : "text-muted-foreground")}>
                Blog
              </span>
            </Link>
            <a href="#" className="text-muted-foreground transition-colors hover:text-primary">
              Matches
            </a>
            <a href="#" className="text-muted-foreground transition-colors hover:text-primary">
              Teams
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <button className="hidden sm:inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-[0_0_15px_-3px_var(--color-primary)] transition-transform hover:scale-105 active:scale-95">
              Join League
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative">
        {/* Background Elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-[20%] -right-[10%] h-[500px] w-[500px] rounded-full bg-primary/5 blur-[100px]" />
          <div className="absolute top-[40%] -left-[10%] h-[400px] w-[400px] rounded-full bg-secondary/5 blur-[100px]" />
        </div>
        
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12">
        <div className="container grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2 font-display text-2xl font-bold tracking-tighter">
              <span className="text-primary">SSPL</span>
              <span className="text-foreground">T10</span>
            </div>
            <p className="text-sm text-muted-foreground">
              South India's premier tennis ball cricket league. Elevating street talent to professional heights.
            </p>
          </div>
          
          <div>
            <h4 className="mb-4 font-display text-lg font-bold">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary">About Us</a></li>
              <li><a href="#" className="hover:text-primary">Format</a></li>
              <li><a href="#" className="hover:text-primary">Teams</a></li>
              <li><a href="#" className="hover:text-primary">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="mb-4 font-display text-lg font-bold">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/blog"><span className="hover:text-primary cursor-pointer">Blog</span></Link></li>
              <li><a href="#" className="hover:text-primary">Rules</a></li>
              <li><a href="#" className="hover:text-primary">Fixtures</a></li>
              <li><a href="#" className="hover:text-primary">Results</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="mb-4 font-display text-lg font-bold">Follow Us</h4>
            <div className="flex gap-4">
              {/* Social Icons Placeholder */}
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer">IG</div>
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer">YT</div>
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer">FB</div>
            </div>
          </div>
        </div>
        <div className="container mt-12 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          © 2025 SSPLT10. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
