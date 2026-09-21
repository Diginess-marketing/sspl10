import React, { useState, useEffect } from 'react';
import SEO from '@/components/SEO';
import LiteYouTube from '@/components/LiteYouTube';
import fallbackVideos from '@/data/videos';
import VideoWarContest from '@/components/VideoWarContest';
import SSPLSocialWallSection from '@/components/SSPLSocialWallSection';
import SSPLHighlightsSection from '@/components/SSPLHighlightsSection';
import { generateVideoSchema, generateWebPageSchema } from '@/utils/seoOptimization';
import { fetchAllYouTubeContent, YouTubeVideo } from '@/services/youtubeService';
import { Skeleton } from '@/components/ui/skeleton';

const VideosPage: React.FC = () => {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const loadVideos = async () => {
      try {
        const data = await fetchAllYouTubeContent();
        if (data && data.length > 0) {
          setVideos(data);
        } else {
          // Fallback to static data if API fails
          setVideos(fallbackVideos.map(v => ({
            id: v.youtubeId,
            title: v.title,
            description: v.description,
            thumbnail: `https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg`,
            publishedAt: v.publishedAt,
            isShort: false
          })));
        }
      } catch (error) {
        console.error('Error loading videos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadVideos();
  }, []);

  const displayedVideos = showAll ? videos : videos.slice(0, 6);

  return (
    <main id="main-content" className="w-full overflow-hidden">
      <SEO
        config={{
          title: 'SSPL T10 Videos & Highlights',
          description: 'Watch match highlights, interviews, and social media buzz from SSPL T10.',
          canonical: 'https://ssplt10.com/videos',
          ogType: 'website',
        }}
        schemas={[
          generateWebPageSchema({
            name: 'SSPL T10 Videos & Social Wall',
            description: 'Watch match highlights and social buzz from SSPL T10.',
            url: 'https://ssplt10.com/videos',
          }),
          ...videos.map((v) =>
            generateVideoSchema({
              name: v.title,
              description: v.description || `SSPL T10 video: ${v.title}`,
              thumbnailUrl: v.thumbnail || `https://img.youtube.com/vi/${v.id}/hqdefault.jpg`,
              uploadDate: v.publishedAt,
              duration: 'PT2M',
              contentUrl: `https://www.youtube.com/watch?v=${v.id}`,
            }),
          ),
        ]}
      />

      {/* Hero-like Title Section */}
      <div className="bg-[#0A1628] py-16 border-b border-white/5">
        <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold font-display uppercase tracking-wider mb-4 text-white">
                SSPL T10 <span className="text-[#00B4D8]">Action</span>
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg lowercase tracking-widest">
                All the highlights, viral moments, and social buzz in one place.
            </p>
        </div>
      </div>

      {/* Video War Contest section */}
      <VideoWarContest />

      {/* Static Visual Highlights */}
      <SSPLHighlightsSection />

      {/* Recent Videos Grid */}
      <section className="py-24 bg-[#0A1628]/50">
        <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-12">
                <h2 className="text-3xl font-bold text-white uppercase font-display tracking-wide">Latest Highlights</h2>
                <div className="h-px flex-1 bg-white/10 ml-8 hidden md:block" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                    // Loading Skeletons
                    Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="space-y-4 bg-white/5 p-4 rounded-xl border border-white/5 h-full">
                            <Skeleton className="aspect-video w-full rounded-lg bg-white/10" />
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-3/4 bg-white/10" />
                                <Skeleton className="h-4 w-1/2 bg-white/10" />
                            </div>
                        </div>
                    ))
                ) : (
                    displayedVideos.map((v) => (
                    <div key={v.id} className="group space-y-4 bg-white/5 p-4 rounded-xl border border-white/5 hover:border-[#00B4D8]/30 transition-all h-full">
                        <div className="rounded-lg overflow-hidden aspect-video relative bg-black/40">
                            <LiteYouTube id={v.id} title={v.title} />
                        </div>
                        <div className="space-y-1">
                            <div className="text-white font-bold line-clamp-1 group-hover:text-[#00B4D8] transition-colors" title={v.title}>{v.title}</div>
                            <div className="text-white/60 text-xs italic">{new Date(v.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                        </div>
                    </div>
                    ))
                )}
            </div>

            {!loading && videos.length > 6 && (
                <div className="mt-16 text-center">
                    <button 
                        onClick={() => setShowAll(!showAll)}
                        className="inline-flex items-center gap-2 px-10 py-4 bg-white/5 border border-white/10 rounded-xl text-white font-bold uppercase tracking-widest hover:bg-white/10 hover:border-[#00B4D8]/50 transition-all group"
                    >
                        {showAll ? 'Show Highlights Only' : 'View All Highlights'}
                        <div className={`w-2 h-2 rounded-full bg-[#00B4D8] group-hover:animate-ping ${showAll ? 'rotate-180' : ''}`} />
                    </button>
                    <div className="mt-4">
                        <a 
                            href="https://www.youtube.com/@ssplt10" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[#00B4D8] text-sm hover:underline font-medium"
                        >
                            Watch more on SSPL YouTube Channel
                        </a>
                    </div>
                </div>
            )}
        </div>
      </section>

      {/* Social Wall */}
      <SSPLSocialWallSection />

    </main>
  );
};

export default VideosPage;
