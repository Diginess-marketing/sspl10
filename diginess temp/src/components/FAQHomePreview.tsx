
import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { faqData, Language } from '@/data/faqData';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { fetchCategorizedContent, PlaylistCategory, YouTubeVideo } from '@/services/youtubeService';
import { VideoCarousel } from '@/components/SSPLSocialWallSection';
import { LiteYouTube } from '@/components/LiteYouTube';

const languageNames: Record<string, string> = {
    en: 'English',
    hi: 'हिंदी (Hindi)',
    ta: 'தமிழ் (Tamil)',
    te: 'తెలుగు (Telugu)',
    ml: 'മലയാളം (Malayalam)',
    kn: 'ಕನ್ನಡ (Kannada)',
    ur: 'اردو (Urdu)',
};

const langToPlaylistKeywords: Record<string, string[]> = {
    en: ['english'],
    hi: ['hindi', 'हिन्दी', 'हिंदी', 'अक्सर', 'वीडियो', 'प्रश्न', 'सवाल'],
    ta: ['tamil', 'தமிழ்'],
    te: ['telugu', 'తెలుగు'],
    ml: ['malayalam', 'മലയാളം'],
    kn: ['kannada', 'ಕನ್ನಡ'],
    ur: ['hindi', 'हिन्दी', 'हिंदी', 'urdu', 'اردو'],
};

const FAQHomePreview = () => {
    const [currentLang, setCurrentLang] = useState<Language>('en');
    const [faqPlaylists, setFaqPlaylists] = useState<PlaylistCategory[]>([]);
    const [loadingVideos, setLoadingVideos] = useState(true);
    const [activeVideoTab, setActiveVideoTab] = useState<string>('');

    useEffect(() => {
        const loadVideos = async () => {
            try {
                const data = await fetchCategorizedContent();
                const faqs = data.filter(cat => cat.title.toLowerCase().includes('faq'));
                setFaqPlaylists(faqs);
                
                if (faqs.length > 0) {
                    const engFaq = faqs.find(f => f.title.toLowerCase().includes('english'));
                    setActiveVideoTab(engFaq ? engFaq.id : faqs[0].id);
                }
            } catch (error) {
                console.error('Failed to load FAQ videos:', error);
            } finally {
                setLoadingVideos(false);
            }
        };
        loadVideos();
    }, []);

    // Determine which questions to show based on selected language
    // Assuming 'registration' or 'general' is the first meaningful category. We take from the first category.
    // Use useMemo to ensure React recalculates the preview questions when language changes
    const previewQuestionsWithVideos = useMemo(() => {
        const langData = faqData[currentLang];
        let items = [];
        // Ensure data exists, fallback to english first category otherwise
        if (!langData || langData.length === 0) {
            items = faqData['en'][0].items.slice(0, 5);
        } else {
            // Find the registration category as it has the actual translations
            const registrationCategory = langData.find(cat => cat.id === 'registration');
            if (registrationCategory) {
                items = registrationCategory.items.slice(0, 5);
            } else {
                // Fallback to the first category if registration is not found
                items = langData[0].items.slice(0, 5);
            }
        }

        // Find the playlist for the current language
        const effectiveLang = currentLang === 'ur' ? 'hi' : currentLang;
        const keywords = langToPlaylistKeywords[effectiveLang] || [effectiveLang];
        const currentLangPlaylist = faqPlaylists.find(p => 
            keywords.some(kw => p.title.toLowerCase().includes(kw)),
        );

        return items.map(item => {
            let matchedVideo: YouTubeVideo | undefined = undefined;
            
            // 1. Try Identifier-Based Matching (Robust for localized videos with English titles)
            if (currentLangPlaylist) {
                const categoryToVideoKeyword: Record<string, string> = {
                    registration: 'REGISTRATION',
                    fees: 'FEES',
                    trials: 'TRAILS',
                    results: 'RESULT',
                    general: 'GENERAL',
                    about: 'ABOUT',
                    format: 'FORMAT',
                };
                
                // Find category and index (Home Preview defaults to 'registration' or first)
                const effectiveLang = currentLang === 'ur' ? 'hi' : currentLang;
                const langData = faqData[effectiveLang] || [];
                const parentCategory = langData.find(cat => cat.items.some(i => i.question === item.question));
                const itemIndex = parentCategory?.items.findIndex(i => i.question === item.question) ?? -1;
                
                if (parentCategory && itemIndex !== -1) {
                    const faqIdentifier = `FAQ${itemIndex + 1}`;
                    const faqIdentifierSpace = `FAQ ${itemIndex + 1}`;
                    const categoryKeyword = categoryToVideoKeyword[parentCategory.id];
                    
                    matchedVideo = currentLangPlaylist.videos.find(v => {
                        const vTitle = v.title.toUpperCase();
                        const hasFaqId = vTitle.includes(faqIdentifier.toUpperCase()) || vTitle.includes(faqIdentifierSpace.toUpperCase());
                        const hasCategory = categoryKeyword && vTitle.includes(categoryKeyword);
                        return hasFaqId && hasCategory;
                    });
                }
            }

            // 2. Fallback to Explicit Video ID
            if (!matchedVideo && item.videoId) {
                matchedVideo = currentLangPlaylist?.videos.find(v => v.id === item.videoId) || 
                              { id: item.videoId, title: item.question, thumbnail: '', publishedAt: '' } as YouTubeVideo;
            } 
            
            // 3. Fallback to Keyword-Based Matching
            if (!matchedVideo && currentLangPlaylist) {
                const questionSlug = item.question.toLowerCase().replace(/[?.,!]/g, '').trim();
                matchedVideo = currentLangPlaylist.videos.find(v => {
                    const videoTitle = v.title.toLowerCase();
                    return videoTitle.includes(questionSlug.substring(0, 20)) || 
                           questionSlug.includes(videoTitle.replace(/faq\s*-?\s*|-?\s*faq/i, '').trim().substring(0, 20));
                });
            }
            return { ...item, video: matchedVideo };
        });
    }, [currentLang, faqPlaylists]);
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const toggleAccordion = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="py-24 md:py-32 bg-[#0A1628] relative z-10" id="faq-preview-section">
            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
                    {/* Left: Heading & Intro */}
                    <div className="md:w-1/3 relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center mb-12 md:items-start md:justify-start"
                        >
                            <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter !text-white font-rajdhani">
                                Any <span className="text-[#00B4D8]">Questions?</span>
                            </h2>
                            <div className="w-20 h-1 bg-[#00B4D8] mt-4 rounded-full"></div>
                        </motion.div>
                        <p className="!text-white mb-6 relative z-20 text-center md:text-left">
                            Have questions about the SSPL T10 League? Find answers to common queries about registration, trials, and the tournament structure.
                        </p>

                        <div className="flex justify-center md:justify-start">
                            <Button asChild className="bg-sspl-navy hover:bg-sspl-indigo text-white relative z-20">
                                <Link to="/faqs" className="flex items-center gap-2">
                                    View All FAQs <ArrowRight className="w-4 h-4" />
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* Right: Accordion */}
                    <div className="md:w-2/3 w-full relative z-10">
                        <Accordion type="single" collapsible className="w-full">
                            {previewQuestionsWithVideos.map((faq, index) => (
                                <AccordionItem
                                    key={index}
                                    value={`item-${index}`}
                                    className="border-b border-white/10 last:border-0 bg-white/5 backdrop-blur-sm rounded-lg mb-4 px-4"
                                >
                                    <AccordionTrigger className="text-left py-6 hover:no-underline group">
                                        <span className="text-lg md:text-xl font-bold !text-white group-hover:!text-[#00B4D8] transition-colors font-rajdhani">
                                            {faq.question}
                                        </span>
                                    </AccordionTrigger>
                                    <AccordionContent className="pb-6">
                                        <p className="!text-white/70 text-base md:text-lg leading-relaxed font-medium mb-4">
                                            {faq.answer}
                                        </p>
                                        {faq.video && (
                                            <div className={cn(
                                                'max-w-2xl',
                                                faq.video.isShort ? 'max-w-[280px]' : 'w-full',
                                            )}>
                                                <LiteYouTube 
                                                    id={faq.video.id} 
                                                    title={faq.video.title} 
                                                    variant={faq.video.isShort ? 'short' : 'standard'}
                                                    className="shadow-2xl border border-white/10"
                                                />
                                            </div>
                                        )}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                </div>

                {/* FAQ Videos Section */}
                {!loadingVideos && faqPlaylists.length > 0 && (
                    <div className="mt-20 relative z-10 w-full pt-12 border-t border-white/10">
                        <div className="mb-10">
                            <h3 className="text-3xl md:text-4xl font-bold uppercase tracking-tighter !text-white font-rajdhani">
                                Video <span className="text-[#00B4D8]">FAQs</span>
                            </h3>
                            <div className="w-16 h-1 bg-[#00B4D8] mt-3 rounded-full"></div>
                        </div>
                        
                        {/* Video Tabs */}
                        <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-10">
                            {faqPlaylists.map(playlist => {
                                // Extract just the language name from something like "FAQ - English" or "English FAQ"
                                const shortName = playlist.title.replace(/faq\s*-?\s*|-?\s*faq/i, '').trim() || playlist.title;
                                return (
                                    <button
                                        key={playlist.id}
                                        onClick={() => setActiveVideoTab(playlist.id)}
                                        className={cn(
                                            'px-6 py-2.5 rounded-full font-bold uppercase tracking-wider transition-all duration-300 border text-sm md:text-base cursor-pointer',
                                            activeVideoTab === playlist.id
                                                ? 'bg-[#00B4D8] border-[#00B4D8] text-white shadow-lg shadow-[#00B4D8]/20'
                                                : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10',
                                        )}
                                    >
                                        {shortName}
                                    </button>
                                );
                            })}
                        </div>
                        
                        <div className="space-y-16">
                            {faqPlaylists.map(playlist => (
                                playlist.id === activeVideoTab && (
                                    <motion.div 
                                        key={playlist.id} 
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.4 }}
                                        className="space-y-6"
                                    >
                                        <div className="px-4">
                                            <h4 className="text-xl md:text-2xl font-bold text-white tracking-tight border-l-4 border-[#00B4D8] pl-4">
                                                {playlist.title}
                                            </h4>
                                        </div>
                                        <VideoCarousel 
                                            title={playlist.title}
                                            videos={playlist.videos}
                                            type={playlist.id.includes('shorts') ? 'short' : 'video'}
                                        />
                                    </motion.div>
                                )
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default FAQHomePreview;
