import { useState, useMemo, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Search,
    ChevronRight,
    ChevronDown,
    MessageCircle,
    Globe
} from "lucide-react";
import { cn } from "@/lib/utils";
import { faqData, Language, FAQItem as FAQItemType } from '@/data/faqData'; // Import data and type
import { fetchCategorizedContent, PlaylistCategory, YouTubeVideo } from '@/services/youtubeService';
import { VideoCarousel } from '@/components/SSPLSocialWallSection';
import { LiteYouTube } from '@/components/LiteYouTube';
import { motion } from 'framer-motion';

const translations: Record<Language, { title: string, subtitle: string, searchPlaceholder: string, noResultsTitle: string, noResultsDesc: string, questionsTitle: string, questionsDesc: string, whatsappBtn: string }> = {
    en: {
        title: 'Frequently Asked Questions',
        subtitle: 'Everything you need to know about the SSPL T10 League.',
        searchPlaceholder: 'Search for questions...',
        noResultsTitle: 'No results found',
        noResultsDesc: 'Try a different search term or browse other categories.',
        questionsTitle: 'Still have questions?',
        questionsDesc: 'Chat with our support team on WhatsApp.',
        whatsappBtn: 'WhatsApp Support'
    },
    hi: {
        title: 'अक्सर पूछे जाने वाले प्रश्न',
        subtitle: 'एसएसपीएल टी10 लीग के बारे में आपको जो कुछ पता होना चाहिए।',
        searchPlaceholder: 'प्रश्न खोजें...',
        noResultsTitle: 'कोई परिणाम नहीं मिला',
        noResultsDesc: 'एक अलग खोज शब्द आज़माएं या अन्य श्रेणियों को ब्राउज़ करें।',
        questionsTitle: 'अभी भी प्रश्न हैं?',
        questionsDesc: 'व्हाट्सएप पर हमारी सहायता टीम से चैट करें।',
        whatsappBtn: 'व्हाट्सएप सहायता'
    },
    ta: {
        title: 'அடிக்கடி கேட்கப்படும் கேள்விகள்',
        subtitle: 'SSPL T10 லீக் பற்றி நீங்கள் தெரிந்து கொள்ள வேண்டிய அனைத்தும்.',
        searchPlaceholder: 'கேள்விகளைத் தேடுங்கள்...',
        noResultsTitle: 'முடிவுகள் எதுவும் கிடைக்கவில்லை',
        noResultsDesc: 'வேறு தேடல் சொல்லை முயற்சிக்கவும் அல்லது பிற வகைகளை உலாவவும்.',
        questionsTitle: 'இன்னும் கேள்விகள் உள்ளதா?',
        questionsDesc: 'WhatsApp இல் எங்கள் ஆதரவு குழுவுடன் அரட்டையடிக்கவும்.',
        whatsappBtn: 'WhatsApp ஆதரவு'
    },
    te: {
        title: 'తరచుగా అడిగే ప్రశ్నలు',
        subtitle: 'SSPL T10 లీగ్ గురించి మీరు తెలుసుకోవలసిన ప్రతిదీ.',
        searchPlaceholder: 'ప్రశ్నల కోసం వెతకండి...',
        noResultsTitle: 'ఎలాంటి ఫలితాలు దొరకలేదు',
        noResultsDesc: 'వేరే శోధన పదాన్ని ప్రయత్నించండి లేదా ఇతర వర్గాలను బ్రౌజ్ చేయండి.',
        questionsTitle: 'ఇంకా ప్రశ్నలు ఉన్నాయా?',
        questionsDesc: 'WhatsAppలో మా మద్దతు బృందంతో చాట్ చేయండి.',
        whatsappBtn: 'WhatsApp మద్దతు'
    },
    ml: {
        title: 'പതിവ് ചോദ്യങ്ങൾ',
        subtitle: 'SSPL T10 ലീഗിനെക്കുറിച്ച് നിങ്ങൾ അറിയേണ്ടതെല്ലാം.',
        searchPlaceholder: 'ചോദ്യങ്ങൾക്കായി തിരയുക...',
        noResultsTitle: 'ഫലങ്ങളൊന്നും കണ്ടെത്തിയില്ല',
        noResultsDesc: 'മറ്റൊരു തിരയൽ പദം പരീക്ഷിക്കുക അല്ലെങ്കിൽ മറ്റ് വിഭാഗങ്ങൾ ബ്രൗസ് ചെയ്യുക.',
        questionsTitle: 'ഇപ്പോഴും ചോദ്യങ്ങളുണ്ടോ?',
        questionsDesc: 'WhatsApp-ൽ ഞങ്ങളുടെ പിന്തുണാ ടീമുമായി ചാറ്റ് ചെയ്യുക.',
        whatsappBtn: 'WhatsApp പിന്തുണ'
    },
    kn: {
        title: 'ಪದೇ ಪದೇ ಕೇಳಲಾಗುವ ಪ್ರಶ್ನೆಗಳು',
        subtitle: 'SSPL T10 ಲೀಗ್ ಬಗ್ಗೆ ನೀವು ತಿಳಿದುಕೊಳ್ಳಬೇಕಾದ ಎಲ್ಲವೂ.',
        searchPlaceholder: 'ಪ್ರಶ್ನೆಗಳಿಗಾಗಿ ಹುಡುಕಿ...',
        noResultsTitle: 'ಯಾವುದೇ ಫಲಿತಾಂಶಗಳು ಕಂಡುಬಂದಿಲ್ಲ',
        noResultsDesc: 'ಬೇರೆ ಹುಡುಕಾಟ ಪದವನ್ನು ಪ್ರಯತ್ನಿಸಿ ಅಥವಾ ಇತರ ವರ್ಗಗಳನ್ನು ಬ್ರೌಸ್ ಮಾಡಿ.',
        questionsTitle: 'ಇನ್ನೂ ಪ್ರಶ್ನೆಗಳಿವೆಯೇ?',
        questionsDesc: 'WhatsApp ನಲ್ಲಿ ನಮ್ಮ ಬೆಂಬಲ ತಂಡದೊಂದಿಗೆ ಚాٹ ಮಾಡಿ.',
        whatsappBtn: 'WhatsApp ಬೆಂಬಲ'
    },
    ur: {
        title: 'اکثر پوچھے گئے سوالات',
        subtitle: 'SSPL T10 لیگ کے بارے میں آپ کو جاننے کی ضرورت ہے۔',
        searchPlaceholder: 'سوالات تلاش کریں...',
        noResultsTitle: 'کوئی نتیجہ نہیں ملا',
        noResultsDesc: 'ایک اور تلاش کی اصطلاح آزمائیں یا دیگر زمرے براؤز کریں۔',
        questionsTitle: 'ابھی بھی سوالات ہیں؟',
        questionsDesc: 'ہمارے سپورٹ ٹیم کے ساتھ WhatsApp پر چیٹ کریں۔',
        whatsappBtn: 'WhatsApp سپورٹ'
    }
};

const langToPlaylistKeywords: Record<string, string[]> = {
    en: ['english'],
    hi: ['hindi', 'हिन्दी', 'हिंदी', 'अक्सर', 'वीडियो', 'प्रश्न', 'सवाल'],
    ta: ['tamil', 'தமிழ்'],
    te: ['telugu', 'తెలుగు'],
    ml: ['malayalam', 'മലയാളം'],
    kn: ['kannada', 'ಕನ್ನಡ'],
    ur: ['hindi', 'हिन्दी', 'हिंदी', 'urdu', 'اردو']
};

const FAQItem = ({ item, video }: { item: FAQItemType, video?: YouTubeVideo }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className={cn(
            "border-b border-[#001B69]/10 pb-4 mb-4 last:border-b-0 last:mb-0 transition-all duration-300",
            isOpen ? "border-l-4 border-l-[#001B69] pl-4 bg-[#001B69]/5 rounded-r-xl shadow-lg" : "border-l-0"
        )}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center text-left gap-4 py-3 md:py-4"
            >
                <h4 className={cn(
                    "text-base md:text-lg font-semibold transition-colors font-body",
                    isOpen ? "!text-[#0047AB]" : "!text-[#001B69]"
                )}>
                    {item.question}
                </h4>
                <ChevronDown className={cn(
                    "w-5 h-5 shrink-0 transition-transform !text-[#001B69]/60",
                    isOpen && "rotate-180"
                )} />
            </button>
            <div className={cn(
                "grid transition-all duration-300 ease-in-out",
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            )}>
                <div className="overflow-hidden">
                    <p className="!text-[#001B69]/80 text-base leading-relaxed font-body pb-3 pr-8">
                        {item.answer}
                    </p>
                    {video && (
                        <div className={cn(
                            "mt-4 mb-6 max-w-2xl mx-auto md:mx-0",
                            video.isShort ? "max-w-[300px]" : "w-full"
                        )}>
                            <LiteYouTube 
                                id={video.id} 
                                title={video.title} 
                                variant={video.isShort ? 'short' : 'standard'}
                                className="shadow-lg border border-gray-100"
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const FAQSection = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState<string>('registration');
    const [language, setLanguage] = useState<Language>(() => {
        // Try to get language from googtrans cookie
        try {
            const match = document.cookie.match(new RegExp('(^| )googtrans=([^;]+)'));
            if (match) {
                const parts = decodeURIComponent(match[2]).split('/');
                const lang = parts[parts.length - 1] as any;
                const validLanguages = ['en', 'hi', 'ta', 'te', 'ml', 'kn', 'ur'];
                if (validLanguages.includes(lang)) return lang as Language;
            }
        } catch (e) {
            console.error('Error reading googtrans cookie:', e);
        }
        return 'en';
    });
    const [faqPlaylists, setFaqPlaylists] = useState<PlaylistCategory[]>([]);
    const [loadingVideos, setLoadingVideos] = useState(true);
    const [activeVideoTab, setActiveVideoTab] = useState<string>('');

    // Synchronize language state with googtrans cookie (Google Translate)
    useEffect(() => {
        const getCookieLang = () => {
            try {
                const match = document.cookie.match(new RegExp('(^| )googtrans=([^;]+)'));
                if (match) {
                    const parts = decodeURIComponent(match[2]).split('/');
                    return parts[parts.length - 1] as any;
                }
            } catch (e) {
                console.error('Error reading googtrans cookie:', e);
            }
            return null;
        };

        const interval = setInterval(() => {
            const currentCookieLang = getCookieLang();
            const validLanguages = ['en', 'hi', 'ta', 'te', 'ml', 'kn', 'ur'];
            if (currentCookieLang && validLanguages.includes(currentCookieLang) && currentCookieLang !== language) {
                setLanguage(currentCookieLang as Language);
            }
        }, 1500); // Polling every 1.5s is sufficient

        return () => clearInterval(interval);
    }, [language]);

    useEffect(() => {
        const loadVideos = async () => {
            try {
                const data = await fetchCategorizedContent();
                // Filter for playlists that contain "faq" OR common terms like "सवाल" or "प्रश्न"
                const faqKeywords = ['faq', 'प्रश्न', 'सवाल', 'अक्सर', 'वीडियो', 'அடிக்கடி', 'ప్రశ్నలు', 'చోద్యങ്ങൾ', 'ಪ್ರಶ್ನೆಗಳು', 'سوالات'];
                const faqs = data.filter(cat => 
                    faqKeywords.some(kw => cat.title.toLowerCase().includes(kw.toLowerCase()))
                );
                
                // If still empty, take everything that isn't Shorts
                const finalFaqs = faqs.length > 0 ? faqs : data.filter(c => c.id !== 'standalone-shorts');
                setFaqPlaylists(finalFaqs);
                
                if (finalFaqs.length > 0) {
                    // Initialization will happen in the sync useEffect below
                    setFaqPlaylists(finalFaqs);
                }
            } catch (error) {
                console.error("Failed to load FAQ videos:", error);
            } finally {
                setLoadingVideos(false);
            }
        };
        loadVideos();
    }, []);

    // Sync video tab when language changes
    useEffect(() => {
        if (faqPlaylists.length > 0) {
            const effectiveLang = language === 'ur' ? 'hi' : language;
            const keywords = langToPlaylistKeywords[effectiveLang] || [effectiveLang];
            const playlist = faqPlaylists.find(p => 
                keywords.some(kw => p.title.toLowerCase().includes(kw))
            );
            
            if (playlist) {
                setActiveVideoTab(playlist.id);
            } else if (!activeVideoTab || !faqPlaylists.find(p => p.id === activeVideoTab)) {
                // If current tab is invalid or not set, default to first available
                setActiveVideoTab(faqPlaylists[0].id);
            }
        }
    }, [language, faqPlaylists]);

    // Get categories based on selected language
    const currentCategories = faqData[language] || [];

    // Get items for active category, filtered by search if applicable, and match with videos
    const { displayedItems, itemsWithVideos } = useMemo(() => {
        const category = currentCategories.find(cat => cat.id === activeCategory);
        let items: FAQItemType[] = [];
        
        if (category) {
            if (!searchQuery.trim()) {
                items = category.items;
            } else {
                const lowerQuery = searchQuery.toLowerCase();
                items = category.items.filter(item =>
                    item.question.toLowerCase().includes(lowerQuery) ||
                    item.answer.toLowerCase().includes(lowerQuery)
                );
            }
        } else if (currentCategories.length > 0) {
            items = currentCategories[0].items;
        }

        // Find the playlist for the current language
        const effectiveLang = language === 'ur' ? 'hi' : language;
        const keywords = langToPlaylistKeywords[effectiveLang] || [effectiveLang];
        let currentLangPlaylist = faqPlaylists.find(p => 
            keywords.some(kw => p.title.toLowerCase().includes(kw))
        );
        
        // Fallback: If no language-specific playlist found, try English or any FAQ playlist
        if (!currentLangPlaylist && faqPlaylists.length > 0) {
            currentLangPlaylist = faqPlaylists.find(p => p.title.toLowerCase().includes('english')) || faqPlaylists[0];
        }
        
        const withVideos = items.map(item => {
            let matchedVideo: YouTubeVideo | undefined = undefined;
            
            // 1. Try Identifier-Based Matching (Robust for localized videos with English titles)
            // Example title: "FAQ 1 - WHAT IS THE REGISTRATION FEE ? [ FEES AND PAYMENT ]"
            if (currentLangPlaylist) {
                const categoryToVideoKeyword: Record<string, string> = {
                    registration: 'REGISTRATION',
                    fees: 'FEES',
                    trials: 'TRAILS',
                    results: 'RESULT',
                    general: 'GENERAL',
                    about: 'ABOUT',
                    format: 'FORMAT'
                };
                
                const parentCategory = currentCategories.find(cat => cat.items.some(i => i.question === item.question));
                const itemIndex = parentCategory?.items.findIndex(i => i.question === item.question) ?? -1;
                
                if (parentCategory && itemIndex !== -1) {
                    const faqIdentifier = `FAQ${itemIndex + 1}`; // Match "FAQ1" or "FAQ 1"
                    const faqIdentifierSpace = `FAQ ${itemIndex + 1}`;
                    const categoryKeyword = categoryToVideoKeyword[parentCategory.id];
                    
                    matchedVideo = currentLangPlaylist.videos.find(v => {
                        const vTitle = v.title.toUpperCase();
                        // Primary check: FAQ N and Category Keyword
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
                const noise = [
                    'how', 'can', 'i', 'what', 'is', 'the', 'are', 'do', 'need', 'to', 'for', 'in', 'of', 'and', 'my', 'ssplt10', 'sspl', 't10', 'faq', 'video', 'fees', 'payment', 'registrations', 'eligibility',
                    'अक्सर', 'पूछे', 'जाने', 'वाले', 'प्रश्न', 'खेल', 'प्ले', 'हैं', 'क्या', 'कैसे', 'सकता', 'हूँ', 'लिए', 'में', 'का', 'की', 'के', 'को', 'था', 'थी', 'थी', 'थे', 'भी', 'और', 'पर', 'से'
                ];
                const cleanWords = (text: string) => text.toLowerCase()
                    .replace(/[?.,!-]/g, ' ')
                    .replace(/[0-9]/g, ' ') // Ignore numbers in matching
                    .split(/\s+/)
                    .filter(word => word.length >= 2 && !noise.includes(word));

                const qWords = cleanWords(item.question);
                
                if (qWords.length === 0) {
                    const questionSlug = item.question.toLowerCase().replace(/[?.,!]/g, '').trim();
                    matchedVideo = currentLangPlaylist.videos.find(v => v.title.toLowerCase().includes(questionSlug));
                } else {
                    let bestScore = 0;
                    for (const video of currentLangPlaylist.videos) {
                        const vWords = cleanWords(video.title);
                        let matches = 0;
                        qWords.forEach(qWord => {
                            if (vWords.some(vWord => vWord.includes(qWord) || qWord.includes(vWord))) {
                                matches++;
                            }
                        });
                        const score = qWords.length > 0 ? matches / qWords.length : 0;
                        
                        if (score > bestScore && (matches > 0)) {
                            bestScore = score;
                            matchedVideo = video;
                        }
                    }
                    
                    if (!matchedVideo || bestScore < 0.2) {
                        const questionSlug = item.question.toLowerCase().replace(/[?.,!]/g, '').trim();
                        matchedVideo = currentLangPlaylist.videos.find(v => {
                            const vTitle = v.title.toLowerCase().replace(/[?.,!]/g, '');
                            return vTitle.includes(questionSlug) || questionSlug.includes(vTitle);
                        });
                    }
                }
            }
            
            return { item, video: matchedVideo };
        });

        return { displayedItems: items, itemsWithVideos: withVideos };
    }, [searchQuery, activeCategory, language, currentCategories, faqPlaylists]);

    const activeData = currentCategories.find(cat => cat.id === activeCategory) || currentCategories[0];

    // Handler to switch language
    const toggleLanguage = (lang: Language) => {
        // We avoid updating state here (setLanguage, setSearchQuery) to prevent 
        // React reconciliation errors when Google Translate has mutated the DOM.
        // The page reload will pick up the new language from the cookie.
        
        // Update googtrans cookie to sync with site-wide language selector
        document.cookie = `googtrans=/en/${lang}; path=/; expires=Fri, 31 Dec 9999 23:59:59 GMT`;
        document.cookie = `googtrans=/en/${lang}; domain=.${window.location.hostname}; path=/`;
        window.location.reload();
    };

    const t = translations[language] || translations['en'];

    return (
        <section id="faq" className="pb-20 pt-28 md:pt-36 bg-[#0047AB]">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12 relative z-10">
                    {/* Language Toggle Dropdown */}
                    <div className="flex justify-center md:justify-end mb-6 md:absolute md:top-0 md:right-0 z-20 notranslate" translate="no">
                        <Select
                            value={language}
                            onValueChange={(val) => toggleLanguage(val as Language)}
                        >
                            <SelectTrigger className="w-[180px] bg-white/10 border-white/20 shadow-sm transition-all focus:ring-[#CCFF00] !text-white backdrop-blur-md">
                                <Globe className="w-4 h-4 mr-2 text-[#CCFF00]" />
                                <SelectValue placeholder="Select Language" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#0047AB] max-h-60 rounded-xl overflow-hidden shadow-2xl border-white/10 relative z-50 notranslate" translate="no">
                                <SelectItem value="en" className="focus:bg-white/10 cursor-pointer !text-white">English</SelectItem>
                                <SelectItem value="hi" className="focus:bg-white/10 cursor-pointer !text-white">हिंदी (Hindi)</SelectItem>
                                <SelectItem value="ta" className="focus:bg-white/10 cursor-pointer !text-white">தமிழ் (Tamil)</SelectItem>
                                <SelectItem value="te" className="focus:bg-white/10 cursor-pointer !text-white">తెలుగు (Telugu)</SelectItem>
                                <SelectItem value="ml" className="focus:bg-white/10 cursor-pointer !text-white">മലയാളം (Malayalam)</SelectItem>
                                <SelectItem value="kn" className="focus:bg-white/10 cursor-pointer !text-white">ಕನ್ನಡ (Kannada)</SelectItem>
                                <SelectItem value="ur" className="focus:bg-white/10 cursor-pointer !text-white">اردو (Urdu)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight font-heading uppercase">
                        {t.title}
                    </h2>
                    <p className="text-lg text-white/70 max-w-2xl mx-auto mb-8 font-medium">
                        {t.subtitle}
                    </p>

                    {/* Search Bar */}
                    <div className="max-w-xl mx-auto relative">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-white/40" />
                        </div>
                        <Input
                            type="text"
                            placeholder={t.searchPlaceholder}
                            className="pl-10 h-12 rounded-full border-white/20 !bg-white/10 !text-white placeholder:!text-white/50 shadow-sm focus:border-[#00B4D8] focus:ring-[#00B4D8] text-base"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
                    {/* Sidebar / Mobile Tabs */}
                    <div className="lg:w-1/4">
                        <div className="sticky top-24">
                            {/* Category buttons */}
                            <div className="flex lg:flex-col overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 gap-2 no-scrollbar">
                                {currentCategories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => { setActiveCategory(cat.id); setSearchQuery(""); }}
                                        className={cn(
                                            "flex items-center gap-3 px-4 py-3 rounded-xl whitespace-nowrap lg:whitespace-normal text-sm md:text-base font-bold transition-colors shrink-0 uppercase tracking-widest",
                                            activeCategory === cat.id
                                                ? "bg-[#CCFF00] text-[#0047AB] shadow-lg"
                                                : "bg-white/5 text-white/70 border border-white/10 hover:bg-white/10"
                                        )}
                                    >
                                        <cat.icon className={cn("h-5 w-5 shrink-0", activeCategory === cat.id ? "text-[#0047AB]" : "text-[#CCFF00]")} />
                                        <span>{cat.title}</span>
                                        {activeCategory === cat.id && (
                                            <ChevronRight className="ml-auto h-4 w-4 hidden lg:block text-[#0047AB]" />
                                        )}
                                    </button>
                                ))}
                            </div>

                             <div className="hidden lg:block mt-8 p-5 bg-white/5 rounded-xl border border-white/10">
                                <h4 className="font-bold mb-2 flex items-center gap-2" style={{ color: '#001B69' }}>
                                    <MessageCircle className="h-5 w-5" style={{ color: '#001B69' }} />
                                    {t.questionsTitle}
                                </h4>
                                <p className="text-sm text-white/50 mb-4">
                                    {t.questionsDesc}
                                </p>
                                <Button className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-semibold flex items-center justify-center gap-2" onClick={() => window.open('https://wa.me/918807775960', '_blank')}>
                                    <MessageCircle className="w-4 h-4" />
                                    {t.whatsappBtn}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content — only active category */}
                    <div className="lg:w-3/4">
                        {activeData && (
                            <div className="glass-card p-6 md:p-8 rounded-[2rem] border border-[#001B69]/10 bg-white shadow-2xl">
                                <div className="flex items-center gap-3 mb-8 pb-6 border-b border-[#001B69]/10">
                                    <div className="p-3 bg-[#001B69]/10 rounded-xl">
                                        <activeData.icon className="h-7 w-7 text-[#001B69]" />
                                    </div>
                                    <h3 className="text-2xl md:text-3xl font-bold !text-[#001B69] font-heading uppercase tracking-widest">
                                        {activeData.title}
                                    </h3>
                                </div>

                                {itemsWithVideos.length > 0 ? (
                                    <div className="space-y-2">
                                        {itemsWithVideos.map((entry, index) => (
                                            <FAQItem key={index} item={entry.item} video={entry.video} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-16 bg-white/5 border border-dashed border-white/20 rounded-2xl">
                                        <Search className="h-12 w-12 text-white/40 mx-auto mb-4" />
                                        <h3 className="text-lg font-bold !text-white uppercase tracking-wider">
                                            {t.noResultsTitle}
                                        </h3>
                                        <p className="!text-white/60 text-base mt-2">
                                            {t.noResultsDesc}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Contact Box - Mobile Only */}
                        <div className="lg:hidden mt-8 p-5 bg-white/5 rounded-xl border border-white/10 text-center">
                            <h4 className="font-bold mb-2 flex items-center justify-center gap-2" style={{ color: '#001B69' }}>
                                <MessageCircle className="h-5 w-5" style={{ color: '#001B69' }} />
                                {t.questionsTitle}
                            </h4>
                            <p className="text-sm text-white/60 mb-4">
                                {t.questionsDesc}
                            </p>
                            <Button className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-semibold flex items-center justify-center gap-2" onClick={() => window.open('https://wa.me/918807775960', '_blank')}>
                                <MessageCircle className="w-4 h-4" />
                                {t.whatsappBtn}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* FAQ Videos Section */}
                {!loadingVideos && faqPlaylists.length > 0 && (
                    <div className="mt-20 max-w-6xl mx-auto pt-12 border-t border-white/10">
                        <div className="mb-10 text-center md:text-left">
                            <h3 className="text-3xl md:text-4xl font-bold uppercase tracking-tighter !text-white font-rajdhani">
                                Video <span className="text-[#00B4D8]">FAQs</span>
                            </h3>
                            <div className="w-16 h-1 bg-[#00B4D8] mt-3 rounded-full mx-auto md:mx-0"></div>
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
                                            "px-6 py-2.5 rounded-full font-bold uppercase tracking-wider transition-all duration-300 border text-sm md:text-base cursor-pointer",
                                            activeVideoTab === playlist.id
                                                ? "bg-[#00B4D8] border-[#00B4D8] text-white shadow-lg shadow-[#00B4D8]/20"
                                                : "bg-[#0A1628] border-white/10 text-white/60 hover:text-white hover:bg-white/5"
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
                                        className="space-y-6 min-h-[400px]"
                                    >
                                        <div className="px-4">
                                            <h4 className="text-xl md:text-2xl font-bold text-white tracking-tight border-l-4 border-[#00B4D8] pl-4">
                                                {playlist.title}
                                            </h4>
                                        </div>
                                        <VideoCarousel 
                                            key={`${playlist.id}-${playlist.videos.length}`}
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

export default FAQSection;
