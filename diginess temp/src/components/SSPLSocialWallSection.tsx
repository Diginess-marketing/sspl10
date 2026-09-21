import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";
import { Youtube, Instagram, Facebook, Linkedin, Share2, ChevronLeft, ChevronRight, ThumbsUp, MessageCircle, ExternalLink } from 'lucide-react';
import LiteYouTube from '@/components/LiteYouTube';
import { Button } from '@/components/ui/button';
import { fetchCategorizedContent, PlaylistCategory, YouTubeVideo } from '@/services/youtubeService';
import { toast } from 'sonner';

const SOCIAL_VIDEOS_FALLBACK = [
    { id: 'PAJETIqThGY', title: 'The @ssplt10 team is building something powerful', isShort: true },
    { id: 'u5sZbNEmazQ', title: 'SSPL Player Feedback | Real Experience', isShort: true },
    { id: 'slX55Phm27U', title: 'Players Speak Out! SSPL Trials Experience', isShort: true },
    { id: '4yhZ5KhLCHg', title: 'From Street Cricket to Big League', isShort: true },
    { id: 'FQXu-GSw1u8', title: 'Karnataka Trials | What Players Say', isShort: true },
    { id: 'J1ooFrsLyiE', title: 'SSPL Trials Reality | What Players Really Feel', isShort: true },
    { id: '3DpRuyqEq3A', title: 'Players Speak Out! SSPL Trials Experience', isShort: true },
    { id: 'fdJasiXPnGM', title: 'Tennis ball cricket ka sabse bada manch!', isShort: true },
];

const SocialCard = ({ video }: { video: YouTubeVideo }) => {
    const handleShare = async () => {
        const url = `https://youtube.com/${video.isShort ? 'shorts/' : 'watch?v='}${video.id}`;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: video.title,
                    url: url,
                });
            } catch (err) {
                if ((err as Error).name !== 'AbortError') {
                    copyToClipboard(url);
                }
            }
        } else {
            copyToClipboard(url);
        }
    };

    const copyToClipboard = (url: string) => {
        navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard!');
    };

    const formatCount = (count?: string) => {
        if (!count) return '0';
        const num = parseInt(count);
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    const videoUrl = `https://youtube.com/${video.isShort ? 'shorts/' : 'watch?v='}${video.id}`;

    return (
        <div className="relative group rounded-[2rem] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(233,87,33,0.3)] h-full">
            <div className="absolute -inset-[3px] bg-gradient-to-b from-sspl-orange via-sspl-orange-hover to-sspl-navy rounded-[2.2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-[2px]"></div>

            <div className="relative bg-white rounded-[2rem] overflow-hidden border-4 border-white shadow-lg ring-1 ring-slate-100 flex flex-col h-full">
                <div className={video.isShort ? "aspect-[9/16] w-full bg-slate-100 relative" : "aspect-video w-full bg-slate-100 relative"}>
                    <LiteYouTube
                        id={video.id}
                        title={video.title}
                        variant={video.isShort ? "short" : "standard"}
                        posterQuality="hqdefault"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none"></div>
                </div>

                <div className="p-4 flex flex-col flex-1">
                    <h3 className="text-sm font-bold !text-black line-clamp-2 mb-1 min-h-[1.25rem]">
                        {video.title}
                    </h3>
                    {video.description && (
                        <p className="text-xs !text-slate-600 line-clamp-2 mb-3 flex-1 font-medium">
                            {video.description}
                        </p>
                    )}

                    <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3">
                        <div className="flex items-center gap-3">
                            <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 !text-slate-500 hover:!text-red-500 transition-colors">
                                <ThumbsUp className="w-4 h-4" />
                                <span className="text-[10px] font-bold">{formatCount(video.likeCount)}</span>
                            </a>
                            <a href={`${videoUrl}#comments`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 !text-slate-500 hover:!text-blue-500 transition-colors">
                                <MessageCircle className="w-4 h-4" />
                                <span className="text-[10px] font-bold">{formatCount(video.commentCount)}</span>
                            </a>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleShare}
                                className="w-8 h-8 flex items-center justify-center bg-slate-50 text-slate-600 rounded-full hover:bg-sspl-tennis-ball-green hover:text-white transition-all shadow-sm"
                                title="Share"
                            >
                                <Share2 className="w-3.5 h-3.5" />
                            </button>
                            <a
                                href={videoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-600 rounded-full hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                title="Watch on YouTube"
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const VideoCarousel = ({ title, videos, type }: { title: string, videos: YouTubeVideo[], type: 'short' | 'video' }) => {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        align: 'start',
        loop: videos.length > 2,
        slidesToScroll: 1,
        breakpoints: {
            '(min-width: 1024px)': { slidesToScroll: 2 }
        }
    }, [
        Autoplay({
            delay: 4000,
            stopOnInteraction: false,
            stopOnMouseEnter: true,
            rootNode: (emblaRoot) => emblaRoot.parentElement
        })
    ]);

    const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

    if (videos.length === 0) return null;

    return (
        <div className="relative">
            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex -ml-4 py-4">
                    {videos.map((video, index) => (
                        <div
                            key={`${video.id}-${index}`}
                            className={type === 'short'
                                ? "flex-[0_0_85%] sm:flex-[0_0_45%] md:flex-[0_0_30%] lg:flex-[0_0_20%] pl-4"
                                : "flex-[0_0_90%] sm:flex-[0_0_60%] md:flex-[0_0_45%] lg:flex-[0_0_33.33%] pl-4"}
                        >
                            <SocialCard video={video} />
                        </div>
                    ))}
                </div>
            </div>

            {videos.length > 1 && (
                <>
                    <button
                        onClick={scrollPrev}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-8 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-[#00B4D8] transition-all shadow-xl group active:scale-95 z-20"
                        aria-label="Previous"
                    >
                        <ChevronLeft strokeWidth={3} className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                    </button>

                    <button
                        onClick={scrollNext}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-8 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-[#00B4D8] transition-all shadow-xl group active:scale-95 z-20"
                        aria-label="Next"
                    >
                        <ChevronRight strokeWidth={3} className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </button>
                </>
            )}
        </div>
    );
};

const SSPLSocialWallSection = () => {
    const [categories, setCategories] = useState<PlaylistCategory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadContent = async () => {
            setLoading(true);
            try {
                const data = await fetchCategorizedContent();
                if (data && data.length > 0) {
                    setCategories(data);
                } else {
                    const fallback = [
                        { id: 'shorts', title: 'Latest Shorts', videos: (SOCIAL_VIDEOS_FALLBACK as any[]).filter(v => v.isShort) }
                    ];
                    setCategories(fallback);
                }
            } catch (err) {
                const fallback = [
                    { id: 'shorts', title: 'Latest Shorts', videos: (SOCIAL_VIDEOS_FALLBACK as any[]).filter(v => v.isShort) }
                ];
                setCategories(fallback);
            } finally {
                setLoading(false);
            }
        };
        loadContent();
    }, []);

    const nonFaqCategories = categories.filter(
        (cat) => !cat.title.toLowerCase().includes('faq')
    );

    return (
        <section className="py-20 md:py-32 relative overflow-hidden bg-[#0A1628]">
            {/* Background removed, just solid color above */}
            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center mb-8"
                    >
                        <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter !text-white font-heading">
                            Social <span className="text-[#00B4D8]">Wall</span>
                        </h2>
                        <div className="w-24 h-1.5 bg-[#00B4D8] mt-4 rounded-full"></div>
                    </motion.div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="aspect-[9/16] bg-white/5 rounded-[2rem]"></div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-12">
                        {/* Playlist Categories */}
                        <div className="space-y-16">
                            {nonFaqCategories.map((category) => (
                                <motion.div
                                    key={category.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className="space-y-6"
                                >
                                    <div className="px-4">
                                        <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight border-l-4 border-[#00B4D8] pl-4">
                                            {category.title}
                                        </h3>
                                    </div>
                                    <VideoCarousel
                                        title={category.title}
                                        videos={category.videos}
                                        type={category.id.includes('shorts') ? 'short' : 'video'}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mt-12 text-center p-8 md:p-16 rounded-[4rem] border border-sspl-orange/20 max-w-5xl mx-auto relative overflow-hidden group shadow-xl">
                    {/* Solid Light Blue Background */}
                    <div className="absolute inset-0 bg-sspl-navy/5 z-0"></div>

                    <div className="relative z-10">
                        <h4 className="text-3xl md:text-5xl font-black !text-white mb-6 tracking-tight uppercase leading-tight">
                            Be part of the <span className="text-sspl-tennis-ball-green">Action!</span>
                        </h4>
                        <p className="!text-white mb-10 max-w-2xl mx-auto text-lg md:text-xl font-medium">
                            Don't miss match highlights, trial sessions, and exclusive behind-the-scenes content. Join our growing community!
                        </p>

                        <div className="flex flex-wrap justify-center items-center gap-6">
                            <Button
                                className="rounded-full bg-sspl-tennis-ball-green hover:bg-sspl-tennis-ball-green-hover text-white font-bold transition-all px-10 py-8 h-auto text-xl shadow-2xl shadow-sspl-orange/30 hover:-translate-y-1"
                                onClick={() => window.open('https://www.youtube.com/@Southernstreetpremierleague', '_blank')}
                            >
                                <Youtube className="w-6 h-6 mr-3" />
                                Subscribe Now
                            </Button>

                            <div className="flex items-center gap-4">
                                <a href="https://www.facebook.com/ssplt10" target="_blank" rel="noopener noreferrer" className="w-14 h-14 bg-white !text-[#1877F2] rounded-full flex items-center justify-center hover:bg-[#1877F2] hover:text-white transition-all shadow-md border border-slate-100"><Facebook className="w-7 h-7" /></a>
                                <a href="https://www.instagram.com/ssplt10" target="_blank" rel="noopener noreferrer" className="w-14 h-14 bg-white !text-[#E4405F] rounded-full flex items-center justify-center hover:bg-gradient-to-tr hover:from-yellow-400 hover:via-pink-500 hover:to-purple-600 hover:text-white transition-all shadow-md border border-slate-100"><Instagram className="w-7 h-7" /></a>
                                <a href="https://www.linkedin.com/company/ssplt10" target="_blank" rel="noopener noreferrer" className="w-14 h-14 bg-white !text-[#0A66C2] rounded-full flex items-center justify-center hover:bg-[#0A66C2] hover:text-white transition-all shadow-md border border-slate-100"><Linkedin className="w-7 h-7" /></a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export { VideoCarousel, SocialCard };
export default SSPLSocialWallSection;
