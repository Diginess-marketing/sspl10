import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { X, Send, Bot, Mic, Volume2, RefreshCcw, Phone, PhoneOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AnimatePresence, motion } from 'framer-motion';
import { faqData, Language, FAQItem } from '@/data/faqData'; // Import FAQ data
import { supabase } from '@/integrations/supabase/client';
import VoiceCallAvatar from './VoiceCallAvatar';

// API URL - Debugging
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
// console.log('ChatWidget Context:', { hostname: window.location.hostname, isLocal });

// API_URL removed - using Supabase Edge Functions

interface ChatOption {
    label: string;
    value: string;
    type: 'category' | 'question' | 'language';
    answer?: string;
}

interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
    options?: ChatOption[];
}

// Generate a unique session ID
const generateSessionId = () => {
    return `chat_${  Date.now()  }_${  Math.random().toString(36).substring(2, 9)}`;
};

const ChatWidget = ({ fullScreen = false }: { fullScreen?: boolean }) => {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(fullScreen ? true : false);
    const [isHovered, setIsHovered] = useState(false);
    const [language, setLanguage] = useState<Language | null>(null);
    const [mobileNumber, setMobileNumber] = useState('');
    const [step, setStep] = useState<'language' | 'mobile' | 'menu' | 'chat'>('language');
    const [isCallMode, setIsCallMode] = useState(false);
    const isCallModeRef = useRef(false);
    const isBotTalkingRef = useRef(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [callStartTime, setCallStartTime] = useState(0);

    useEffect(() => {
        isCallModeRef.current = isCallMode;
    }, [isCallMode]);

    // Listen for external open requests (e.g., from WhatsApp FAB)
    useEffect(() => {
        const handleOpenChat = () => setIsOpen(true);
        window.addEventListener('open-chatbot', handleOpenChat);
        return () => window.removeEventListener('open-chatbot', handleOpenChat);
    }, []);

    const handleSendMessageRef = useRef<any>(null);
    const [sessionId, setSessionId] = useState(generateSessionId());

    const toggleChat = () => setIsOpen(!isOpen);

    const languageOptions: ChatOption[] = [
        { label: 'English', value: 'en', type: 'language' },
        { label: 'हिंदी (Hindi)', value: 'hi', type: 'language' },
        { label: 'தமிழ் (Tamil)', value: 'ta', type: 'language' },
        { label: 'తెలుగు (Telugu)', value: 'te', type: 'language' },
        { label: 'മലയാളം (Malayalam)', value: 'ma', type: 'language' },
        { label: 'ಕನ್ನಡ (Kannada)', value: 'ka', type: 'language' },
        { label: 'اردو (Urdu)', value: 'ur', type: 'language' },
    ];

    const localizedWelcomeMessages: Record<string, string> = {
        'en': 'Hello! I am your SSPL Customer Care Executive. How can I assist you?',
        'hi': 'नमस्ते! मैं आपका SSPL ग्राहक सेवा अधिकारी हूँ। मैं आपकी कैसे सहायता कर सकता हूँ?',
        'ta': 'வணக்கம்! நான் உங்கள் SSPL வாடிக்கையாளர் சேவை நிர்வாகி. நான் உங்களுக்கு எப்படி உதவ முடியும்?',
        'te': 'నమస్కారం! నేను మీ SSPL కస్టమర్ కేర్ ఎగ్జిక్యూటివ్‌ను. నేను మీకు ఎలా సహాయపడగలను?',
        'ma': 'നമസ്കാരം! ഞാൻ നിങ്ങളുടെ SSPL കസ്റ്റമർ കെയർ എക്സിക്യൂട്ടീവ് ആണ്. എനിക്ക് നിങ്ങളെ എങ്ങനെ സഹായിക്കാനാകും?',
        'ka': 'ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ SSPL ಗ್ರಾಹಕ ಸೇವಾ ಕಾರ್ಯನಿರ್ವಾಹಕ. ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?',
        'ur': 'ہیلو! میں آپ کا SSPL کسٹمر کیئر ایگزیکٹو ہوں۔ میں آپ کی کیسے مدد کر سکتا ہوں?',
        'ml': 'നമസ്കാരം! ഞാൻ നിങ്ങളുടെ SSPL കസ്റ്റമർ കെയർ എക്സിക്യൂട്ടീവ് ആണ്. എനിക്ക് നിങ്ങളെ എങ്ങനെ സഹായിക്കാനാകും?',
    };

    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: 'Welcome to SSPL T10! Please select your language to continue.',
            options: languageOptions,
        },
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const lastMessageRef = useRef<HTMLDivElement>(null);

    // Save conversation to Supabase (non-blocking)
    const saveConversation = useCallback(async (msgs: Message[], mode: string, mobile?: string, lang?: string | null) => {
        try {
            // Only save if there are actual user messages (not just the initial greeting)
            const hasUserMessages = msgs.some(m => m.role === 'user');
            if (!hasUserMessages) return;

            const cleanMessages = msgs.map(m => ({
                role: m.role,
                content: m.content,
                ...(m.options ? { options: m.options.map(o => o.label) } : {}),
            }));

            const { error } = await supabase
                .from('chat_conversations' as any)
                .upsert({
                    session_id: sessionId,
                    mobile: mobile || null,
                    language: lang || 'en',
                    mode,
                    messages: cleanMessages,
                    updated_at: new Date().toISOString(),
                }, { onConflict: 'session_id' });

            if (error) {
                console.warn('[ChatWidget] Failed to save conversation:', error.message);
            }
        } catch (err) {
            console.warn('[ChatWidget] Error saving conversation:', err);
        }
    }, [sessionId]);

    // Voice Chat State
    const [isListening, setIsListening] = useState(false);
    const [speechSupported, setSpeechSupported] = useState(false);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            setSpeechSupported(true);
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;

            recognitionRef.current.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                if (isCallModeRef.current && handleSendMessageRef.current) {
                    // Temporarily set isCallModeRef false to prevent onend from double-looping empty mic
                    handleSendMessageRef.current(transcript);
                } else {
                    setInputValue(prev => prev + (prev ? ' ' : '') + transcript);
                }
                setIsListening(false);
            };

            recognitionRef.current.onerror = (event: any) => {
                // 'no-speech' is a normal timeout when the user doesn't say anything.
                // We should silently ignore it and let the loop naturally restart.
                if (event.error !== 'no-speech') {
                    console.error('Speech recognition error:', event.error);
                }

                setIsListening(false);
                if (isCallModeRef.current && !isBotTalkingRef.current) {
                    // Auto-restart listening if error occurs in voice mode while waiting for user
                    setTimeout(() => startListening(), 500);
                }
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
                // In call mode, if it ended without result, we must restart it to keep the loop alive.
                // handleSendMessageRef handles the case where there *was* a result.
                if (isCallModeRef.current && !isBotTalkingRef.current) {
                    setTimeout(() => startListening(), 500);
                }
            };
        }
    }, []);

    const startListening = () => {
        if (!recognitionRef.current) return;
        try {
            const langMap: Record<string, string> = {
                'en': 'en-IN',
                'hi': 'hi-IN',
                'ta': 'ta-IN',
                'te': 'te-IN',
                'ma': 'ml-IN',
                'ka': 'kn-IN',
                'ur': 'ur-PK',
            };
            recognitionRef.current.lang = langMap[language || 'en'] || 'en-IN';
            recognitionRef.current.start();
            setIsListening(true);
        } catch (e) {
            console.warn('Microphone already listening or error:', e);
        }
    };

    const toggleListening = () => {
        if (!recognitionRef.current) return;

        if (isListening) {
            recognitionRef.current.stop();
        } else {
            startListening();
        }
    };

    const currentAudioRef = useRef<HTMLAudioElement | null>(null);

    const speakText = async (text: string, onPlaybackEnd?: () => void) => {
        setIsSpeaking(true);
        // Stop any currently playing audio track
        if (currentAudioRef.current) {
            currentAudioRef.current.pause();
            currentAudioRef.current.currentTime = 0;
            currentAudioRef.current = null;
        }

        // Cancel browser TTS
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        // Try Sarvam API for instantaneous high-quality regional voice
        try {
            const SARVAM_API_KEY = 'sk_m73kio8h_04B7T8qzwRqnn6epiSCZqxVy';
            const functionUrl = 'https://api.sarvam.ai/text-to-speech';

            // Map frontend languages to Sarvam supported language codes
            const langMap: Record<string, string> = {
                'en': 'en-IN',
                'hi': 'hi-IN',
                'ta': 'ta-IN',
                'te': 'te-IN',
                'ma': 'ml-IN',
                'ka': 'kn-IN',
                'ur': 'hi-IN', // Sarvam doesn't officially support Urdu yet, Hindi provides closest natural fallback
            };

            const targetLang = langMap[language || 'en'] || 'en-IN';

            // Pronunciation fixes for brand terms
            let spokenText = text;
            spokenText = spokenText.replace(/SSPL/gi, 'S S P L');
            spokenText = spokenText.replace(/T10/gi, 'T ten');

            const requestBody = {
                inputs: [spokenText],
                target_language_code: targetLang,
                speaker: 'anushka',
                pitch: 0,
                pace: 1.05,
                loudness: 1.5,
                speech_sample_rate: 8000,
                enable_preprocessing: true,
                model: 'bulbul:v2',
            };

            const response = await fetch(functionUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-subscription-key': SARVAM_API_KEY,
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const errBody = await response.text();
                throw new Error(`Sarvam TTS API returned ${response.status}: ${errBody}`);
            }

            const data = await response.json();

            // Sarvam TTS returns base64 encoded audio in `audios[0]`
            if (!data.audios || data.audios.length === 0) {
                throw new Error('No audio returned from Sarvam API');
            }

            const audioSrc = `data:audio/wav;base64,${data.audios[0]}`;
            const audio = new Audio(audioSrc);
            currentAudioRef.current = audio;

            if (onPlaybackEnd) {
                audio.onended = () => {
                    isBotTalkingRef.current = false;
                    setIsSpeaking(false);
                    onPlaybackEnd();
                };
            } else {
                audio.onended = () => { isBotTalkingRef.current = false; setIsSpeaking(false); };
            }

            audio.onerror = () => {
                console.error('[Sarvam TTS] Audio playback error');
                isBotTalkingRef.current = false;
                setIsSpeaking(false);
                if (onPlaybackEnd) onPlaybackEnd();
            };

            // Play and handle potential autoplay rejections
            audio.play().catch(e => {
                console.warn('[Sarvam TTS] Audio play was prevented or failed:', e);
                isBotTalkingRef.current = false;
                setIsSpeaking(false);
                if (onPlaybackEnd) onPlaybackEnd();
            });

            return; // Success — skip browser fallback
        } catch (err) {
            console.warn('Sarvam TTS failed, falling back to browser TTS:', err);
            isBotTalkingRef.current = false;
            setIsSpeaking(false);
        }

        // Fallback to Browser Speech Synthesis
        if ('speechSynthesis' in window) {
            // Pre-process text for better pronunciation
            let spokenText = text;

            // Pronunciation fixes for brand terms
            spokenText = spokenText.replace(/SSPL/g, 'S S P L');
            spokenText = spokenText.replace(/T10/g, 'T ten');

            const utterance = new SpeechSynthesisUtterance(spokenText);

            // Try to find a voice for the selected language
            const langMap: Record<string, string> = {
                'en': 'en-IN',
                'hi': 'hi-IN',
                'ta': 'ta-IN',
                'te': 'te-IN',
                'ma': 'ml-IN',
                'ka': 'kn-IN',
                'ur': 'ur-PK', // Fallback for Urdu
            };
            const targetLang = langMap[language || 'en'] || 'en-IN';
            utterance.lang = targetLang;

            // Adjust rate and pitch to be energetic but still natural
            utterance.rate = 1.05;
            utterance.pitch = 1.1;

            const voices = window.speechSynthesis.getVoices();

            // Priority list of native female voices per language
            const highQualityVoices: Record<string, string[]> = {
                // Prioritize Indian English accents for a native feel
                'en-IN': ['Google English India', 'Microsoft Heera', 'Microsoft Neerja', 'Google UK English Female', 'Google US English Female'],
                'hi-IN': ['Google हिन्दी', 'Microsoft Swara', 'Microsoft Kalpana', 'Google Hindi', 'Lekha'],
                'ta-IN': ['Google தமிழ்', 'Microsoft Pallavi', 'Valluvar'],
                'te-IN': ['Google తెలుగు', 'Microsoft Shruti'],
                'ml-IN': ['Google മലയാളം', 'Microsoft Sobhana'],
                'kn-IN': ['Google ಕನ್ನಡ', 'Microsoft Trupti'],
                'ur-PK': ['Google اردو', 'Microsoft Uzma', 'Google Urdu'],
            };

            const preferredList = highQualityVoices[targetLang] || [];

            let voice: SpeechSynthesisVoice | undefined;

            // 1. Try to find a voice from the high-quality list (exact or partial match)
            for (const preferredName of preferredList) {
                voice = voices.find(v => v.name.includes(preferredName) || v.name === preferredName);
                if (voice) break;
            }

            // 2. If not found, try to find any "Female" voice in the target language
            if (!voice) {
                voice = voices.find(v => v.lang === targetLang && v.name.includes('Female'));
            }

            // 3. If no explicit "Female" voice, prefer Google voices (often better quality/female)
            if (!voice) {
                voice = voices.find(v => v.lang === targetLang && v.name.includes('Google'));
            }

            // 4. Fallback to any voice in the target language
            if (!voice) {
                voice = voices.find(v => v.lang === targetLang);
            }

            // 5. Absolute fallback for English (if target was en-IN but failed)
            if (!voice && targetLang === 'en-IN') {
                voice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Female')));
            }

            if (voice) {
                utterance.voice = voice;
                // console.log('Selected voice:', voice.name, 'Language:', targetLang);
            }
            utterance.onend = () => {
                isBotTalkingRef.current = false;
                setIsSpeaking(false);
                if (onPlaybackEnd) onPlaybackEnd();
            };
            utterance.onerror = () => {
                isBotTalkingRef.current = false;
                setIsSpeaking(false);
                if (onPlaybackEnd) onPlaybackEnd();
            };

            window.speechSynthesis.speak(utterance);
        }
    };

    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({
                top: scrollContainerRef.current.scrollHeight,
                behavior: 'smooth',
            });
        } else {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        const lastMsg = messages[messages.length - 1];
        if (lastMsg?.role === 'assistant') {
            // If it's the bot, scroll to the start of the message so users don't miss the beginning
            setTimeout(() => {
                if (lastMessageRef.current && scrollContainerRef.current) {
                    const scrollTarget = lastMessageRef.current.offsetTop - 20;
                    scrollContainerRef.current.scrollTo({
                        top: scrollTarget,
                        behavior: 'smooth',
                    });
                } else {
                    lastMessageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }, 100);
        } else {
            // For user messages, just scroll to bottom
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleOptionClick = (option: ChatOption) => {
        // Add user selection as a message
        const userMsg: Message = { role: 'user', content: option.label };

        // Update messages with user selection immediately
        setMessages(prev => [...prev, userMsg]);

        let botResponse: Message;

        if (option.type === 'language') {
            const selectedLang = option.value as Language;
            setLanguage(selectedLang);
            setStep('mobile');

            botResponse = {
                role: 'assistant',
                content: `You selected ${option.label}. Please provide your 10-digit mobile number to help us assist you better.`,
            };

            // Add bot response after a short delay for natural feel
            setTimeout(() => {
                setMessages(prev => [...prev, botResponse]);
            }, 500);
            return;
        }

        const currentLang = language || 'en';

        if (option.type === 'category') {
            // Find the category and list its questions
            const category = faqData[currentLang].find(c => c.id === option.value);
            if (category) {
                const questions: ChatOption[] = category.items.map((item: FAQItem, index: number) => ({
                    label: item.question,
                    value: `q-${option.value}-${index}`,
                    type: 'question',
                    answer: item.answer,
                }));

                botResponse = {
                    role: 'assistant',
                    content: `Here are some common questions about ${category.title}:`,
                    options: questions,
                };
            } else {
                botResponse = { role: 'assistant', content: "I couldn't find details for that category." };
            }
        } else if (option.type === 'question' && option.answer) {
            // Show the answer

            // Re-generate categories for "Back to Main Menu"
            const categories: ChatOption[] = faqData[currentLang].map(cat => ({
                label: cat.title,
                value: cat.id,
                type: 'category',
            }));

            botResponse = {
                role: 'assistant',
                content: option.answer,
                // Offer main categories again after an answer
                options: [
                    { label: 'Back to Main Menu', value: 'main-menu', type: 'category' }, // Special case handled below
                    ...categories,
                ],
            };
        } else {
            // Fallback
            botResponse = { role: 'assistant', content: "I'm not sure about that one." };
        }

        if (option.value === 'main-menu') {
            const categories: ChatOption[] = faqData[currentLang].map(cat => ({
                label: cat.title,
                value: cat.id,
                type: 'category',
            }));

            botResponse = {
                role: 'assistant',
                content: 'Sure, what else can I help you with?',
                options: categories,
            };
        }

        setTimeout(() => {
            setMessages(prev => [...prev, botResponse]);
        }, 500);
    };

    const handleSendMessage = async (overrideText?: string) => {
        const textToSend = overrideText || inputValue;

        console.log('[DEBUG Voice] handleSendMessage triggered with:', textToSend);

        if (!textToSend.trim()) {
            console.log('[DEBUG Voice] Aborting - empty string');
            return;
        }

        if (isCallModeRef.current) {
            isBotTalkingRef.current = true; // Lock the mic from auto-restarting
        }

        const userMsg = textToSend.trim();
        if (!overrideText) {
            setInputValue('');
        }

        // Add user message
        const newMessages = [...messages, { role: 'user', content: userMsg } as Message];
        setMessages(newMessages);
        setIsLoading(true);

        // Handle Mobile Number Step
        if (step === 'mobile') {
            const mobileRegex = /^[6-9]\d{9}$/;
            if (mobileRegex.test(userMsg)) {
                setMobileNumber(userMsg);
                setStep('menu');

                const currentLang = language || 'en';
                const categories: ChatOption[] = faqData[currentLang].map(cat => ({
                    label: cat.title,
                    value: cat.id,
                    type: 'category',
                }));

                setTimeout(() => {
                    setMessages(prev => [...prev, {
                        role: 'assistant',
                        content: 'Thank you! How can I help you today?',
                        options: categories,
                    }]);
                    setIsLoading(false);
                }, 500);
            } else {
                setTimeout(() => {
                    setMessages(prev => [...prev, {
                        role: 'assistant',
                        content: 'Please enter a valid 10-digit Indian mobile number (starts with 6-9).',
                    }]);
                    setIsLoading(false);
                }, 500);
            }
            return;
        }

        try {
            console.log('[DEBUG Voice] Proceeding to Chat API block. Text:', userMsg);

            // Prepare history for API (excluding initial greeting if needed, or keeping it)
            // The API expects: { message: string, history: [] }
            const history = messages
                .filter(m => m.role !== 'system')
                .map(m => ({ role: m.role, content: m.content }));

            console.log('[ChatWidget] Sending message to chat function:', { message: userMsg, mode: isCallMode ? 'customer_care' : 'chat', language: language || 'en' });

            const { data, error } = await supabase.functions.invoke('chat', {
                body: {
                    message: userMsg,
                    history,
                    language: language || 'en',
                    mobile: mobileNumber,
                    mode: isCallMode ? 'customer_care' : 'chat',
                },
            });

            console.log('[ChatWidget] Chat response:', { data, error });

            if (error) {
                console.error('[ChatWidget] Chat Network Error:', error);
                setMessages(prev => [...prev, { role: 'system', content: `Connection error: ${error.message || 'Please check your connection.'}` }]);
            } else if (data && data.success) {
                const updatedMsgs = [...newMessages, { role: 'assistant' as const, content: data.response }];
                setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
                // Save conversation in background
                saveConversation(updatedMsgs, isCallMode ? 'customer_care' : 'chat', mobileNumber, language);

                if (isCallModeRef.current || isCallMode) {
                    console.log('[DEBUG Voice] Triggering audio playback for AI response:', data.response);
                    speakText(data.response, () => {
                        console.log('[DEBUG Voice] Audio playback finished naturally');
                        if (isCallModeRef.current) {
                            startListening();
                        }
                    });
                }
            } else {
                console.error('[ChatWidget] Chat API Error:', data);
                setMessages(prev => [...prev, { role: 'system', content: `Error: ${data?.error || 'Unknown error. Please try again.'}` }]);
                isBotTalkingRef.current = false;
                if (isCallModeRef.current) startListening();
            }
        } catch (error: any) {
            console.error('[ChatWidget] Chat Exception:', error);
            setMessages(prev => [...prev, { role: 'system', content: `Network error: ${error?.message || 'Please check your connection.'}` }]);
            isBotTalkingRef.current = false;
            if (isCallModeRef.current) startListening();
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        handleSendMessageRef.current = handleSendMessage;
    }, [handleSendMessage]);

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleNewChat = () => {
        // Save current conversation before resetting (if there were user messages)
        saveConversation(messages, isCallMode ? 'customer_care' : 'chat', mobileNumber, language);
        // Generate new session
        setSessionId(generateSessionId());
        setMessages([
            {
                role: 'assistant',
                content: 'Welcome to SSPL T10! Please select your language to continue.',
                options: languageOptions,
            },
        ]);
        setStep('language');
        setLanguage(null);
        setMobileNumber('');
        setInputValue('');
    };

    const [showLanguageSelector, setShowLanguageSelector] = useState(false);

    if (!fullScreen && location.pathname === '/chat') {
        return null;
    }

    return (
        <div className={cn(
            'font-sans',
            fullScreen ? 'w-full h-full flex flex-col' : 'fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4',
        )}>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={fullScreen ? undefined : { opacity: 0, y: 20, scale: 0.95 }}
                        animate={fullScreen ? undefined : { opacity: 1, y: 0, scale: 1 }}
                        exit={fullScreen ? undefined : { opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className={cn(
                            'bg-white flex flex-col overflow-hidden',
                            fullScreen
                                ? 'w-full h-full flex-1 rounded-none shadow-none'
                                : 'fixed bottom-24 right-6 z-50 w-[90vw] max-w-[450px] h-[600px] max-h-[80vh] rounded-2xl shadow-2xl border border-gray-100',
                        )}
                    >
                        {/* Header */}
                        <div className="bg-sspl-navy text-white p-4 flex items-center justify-between shadow-md">
                            <div className="flex items-center gap-2">
                                <div className="bg-white/10 p-1.5 rounded-full">
                                    <Bot size={20} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm text-white">{isCallMode ? 'SSPL Voice Support (Live)' : 'SSPL Customer Care Executive'}</h3>
                                    <div className="flex items-center gap-1.5">
                                        <span className={cn('w-2 h-2 rounded-full animate-pulse', isCallMode ? (isListening ? 'bg-red-500' : 'bg-orange-400') : 'bg-green-400')}></span>
                                        <span className="text-xs text-white/80">
                                            {isCallMode ? (isListening ? 'Listening...' : 'Thinking...') : 'Online'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={handleNewChat}
                                    className="text-white/70 hover:text-white transition-colors p-1"
                                    title="New Chat"
                                >
                                    <RefreshCcw size={18} />
                                </button>
                                <button
                                    onClick={() => {
                                        if (isCallMode) {
                                            setIsCallMode(false);
                                            setShowLanguageSelector(false);
                                            setMessages(prev => [...prev, { role: 'system', content: 'Call ended.' }]);
                                        } else {
                                            setShowLanguageSelector(true);
                                        }
                                    }}
                                    className={cn(
                                        'text-white/70 hover:text-white transition-colors p-1',
                                        isCallMode ? 'bg-red-100/20 text-red-400 rounded-full' : '',
                                    )}
                                    title={isCallMode ? 'End Call' : 'Call Support'}
                                >
                                    {isCallMode ? <PhoneOff size={18} /> : <Phone size={18} />}
                                </button>
                                {!fullScreen && (
                                    <button
                                        onClick={toggleChat}
                                        className="text-white/70 hover:text-white transition-colors p-1"
                                        title="Close"
                                    >
                                        <X size={18} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Language Selector Overlay - moved to floating icon area */}

                        {/* Messages + Voice Avatar Overlay */}
                        <div className="relative flex-1 overflow-hidden">
                            {/* Voice Call Avatar Overlay */}
                            <AnimatePresence>
                                {isCallMode && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.4 }}
                                        className="absolute inset-0 z-30"
                                    >
                                        <VoiceCallAvatar
                                            isSpeaking={isSpeaking}
                                            isListening={isListening}
                                            isLoading={isLoading}
                                            callStartTime={callStartTime}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <div ref={scrollContainerRef} className="h-full overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                                {messages.map((msg, idx) => (
                                    <div
                                        key={idx}
                                        ref={idx === messages.length - 1 ? lastMessageRef : null}
                                        className={cn(
                                            'flex flex-col w-full mb-2', // Changed to flex-col to handle options below bubble
                                            msg.role === 'user' ? 'items-end' : 'items-start',
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                'max-w-[80%] p-3 rounded-2xl text-sm shadow-sm',
                                                msg.role === 'user'
                                                    ? 'bg-sspl-orange text-white rounded-tr-none'
                                                    : msg.role === 'system'
                                                        ? 'bg-red-50 text-red-600 border border-red-100'
                                                        : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none',
                                            )}
                                        >
                                            {msg.content}
                                        </div>
                                        {msg.role === 'assistant' && !isCallMode && (
                                            <button
                                                onClick={() => speakText(msg.content)}
                                                className="ml-2 p-1 text-gray-400 hover:text-[#4C8C00] transition-colors"
                                                title="Read Aloud"
                                            >
                                                <Volume2 size={14} />
                                            </button>
                                        )}

                                        {/* Render Options if any */}
                                        {msg.options && msg.options.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-2 max-w-[85%] justify-start animate-fade-in-up">
                                                {msg.options.map((option, optIdx) => (
                                                    <button
                                                        key={optIdx}
                                                        onClick={() => handleOptionClick(option)}
                                                        className="text-xs bg-white text-[#4C8C00] border border-[#4C8C00]/20 hover:bg-[#4C8C00] hover:text-white px-3 py-1.5 rounded-full transition-colors font-medium shadow-sm"
                                                    >
                                                        {option.label}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex justify-start w-full">
                                        <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        </div>

                        {/* Input */}
                        <div className="p-3 bg-white border-t border-gray-100">
                            <div className="relative flex items-center gap-2">
                                {speechSupported && !isCallMode && (
                                    <button
                                        onClick={toggleListening}
                                        className={cn(
                                            'p-2 rounded-full transition-colors',
                                            isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-100 text-gray-500 hover:bg-gray-200',
                                        )}
                                        title={isListening ? 'Listening...' : 'Speak'}
                                    >
                                        <Mic size={18} />
                                    </button>
                                )}
                                <Input
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    placeholder={isCallMode ? 'Voice mode active...' : 'Type a message...'}
                                    className="pr-10 rounded-full border-gray-200 focus:ring-sspl-navy focus:border-sspl-navy"
                                    disabled={isLoading || isCallMode}
                                />
                                <Button
                                    size="icon"
                                    onClick={() => handleSendMessage()}
                                    disabled={!inputValue.trim() || isLoading || isCallMode}
                                    className={cn(
                                        'rounded-full w-10 h-10 shrink-0 shadow-sm transition-opacity',
                                        isCallMode ? 'opacity-50 cursor-not-allowed bg-gray-400' : 'bg-[#4C8C00] hover:bg-[#3d7000] text-white',
                                    )}
                                >
                                    <Send size={18} className={isLoading ? 'opacity-50' : ''} />
                                </Button>
                            </div>
                            <div className="text-center mt-2">
                                <span className="text-[10px] text-gray-400">Powered by Royal Peacocks and SSPL</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Button + Language Selector */}
            {!isOpen && !fullScreen && (
                <div className="fixed top-[90px] md:top-[140px] right-2 md:right-6 z-40 flex flex-col items-end gap-3">
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        onClick={toggleChat}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        className="flex flex-col items-center gap-1.5 group"
                    >
                        <div className="relative p-0 rounded-full shadow-2xl hover:scale-105 transition-transform border-[3px] border-sspl-orange overflow-hidden bg-white leading-[0]">
                            <img
                                src="/assets/images/Chatbot_Avatar.png"
                                alt="Chat with Suja"
                                className="w-14 h-14 md:w-16 md:h-16 rounded-full object-cover scale-[2.5] translate-y-2"
                            />
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 z-10">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[10px] text-white items-center justify-center font-bold">1</span>
                            </span>
                        </div>
                    </motion.button>

                    {/* Language Selector Dropdown - below chatbot icon */}
                    <AnimatePresence>
                        {showLanguageSelector && !isCallMode && (
                            <motion.div
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 w-[260px]"
                            >
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="bg-sspl-orange/20 p-1.5 rounded-full">
                                        <Phone size={16} className="text-sspl-navy" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-sspl-navy">Voice Call</h4>
                                        <p className="text-[10px] text-gray-400">Select language to start</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { code: 'en', label: 'English', native: 'English' },
                                        { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
                                        { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
                                        { code: 'te', label: 'Telugu', native: 'తెలుగు' },
                                        { code: 'ml', label: 'Malayalam', native: 'മലയാളം' },
                                        { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
                                    ].map((lang) => (
                                        <button
                                            key={lang.code}
                                            onClick={() => {
                                                setLanguage(lang.code as Language);
                                                setShowLanguageSelector(false);
                                                setIsCallMode(true);
                                                setIsOpen(true);
                                                setCallStartTime(Date.now());
                                                isBotTalkingRef.current = true;
                                                setStep('chat');
                                                setTimeout(() => {
                                                    const welcomeMsg = localizedWelcomeMessages[lang.code] || `Hello! I am your SSPL Customer Care Executive in ${lang.label}. How can I assist you?`;
                                                    setMessages(prev => [...prev, { role: 'assistant', content: welcomeMsg }]);
                                                    speakText(welcomeMsg, () => {
                                                        if (isCallModeRef.current) {
                                                            startListening();
                                                        }
                                                    });
                                                }, 500);
                                            }}
                                            className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-gray-100 hover:border-sspl-orange hover:bg-sspl-orange/5 transition-all active:scale-95"
                                        >
                                            <span className="text-sm font-bold text-sspl-navy">{lang.native}</span>
                                            <span className="text-[9px] text-gray-400 uppercase tracking-wider">{lang.label}</span>
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setShowLanguageSelector(false)}
                                    className="w-full mt-3 text-xs text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    Cancel
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default ChatWidget;
