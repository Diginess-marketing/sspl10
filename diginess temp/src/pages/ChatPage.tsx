import { Helmet } from 'react-helmet-async';
import ChatWidget from '@/components/chat/ChatWidget';
import { motion } from 'framer-motion';

const ChatPage = () => {
    return (
        <div className="bg-sspl-navy relative flex flex-col justify-center p-4 sm:p-8" style={{ minHeight: 'calc(100vh - 80px)' }}>
            <Helmet>
                <title>AI Support Hub | SSPL T10</title>
                <meta name="description" content="Chat with SSPL T10 Customer Care Executive. Get instant answers about cricket trials, registration, schedules, and more." />
                <meta property="og:title" content="AI Support Hub | SSPL T10" />
                <meta property="og:description" content="Get instant answers about cricket trials, registration, schedules & more. Chat now with our AI-powered customer care!" />
                <meta property="og:url" content="https://ssplt10.co.in/chat" />
                <meta property="og:type" content="website" />
                <meta property="og:image" content="https://ssplt10.co.in/og-image.jpg" />
                <link rel="canonical" href="https://ssplt10.co.in/chat" />
            </Helmet>

            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                    className="absolute top-1/4 -left-32 w-96 h-96 bg-sspl-orange/20 rounded-full blur-[100px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: 2,
                    }}
                    className="absolute bottom-1/4 -right-32 w-96 h-96 bg-sspl-indigo/20 rounded-full blur-[100px]"
                />
            </div>

            {/* Main Content Glass Card hosting the ChatWidget */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-5xl mx-auto h-[80vh] bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            >
                <ChatWidget fullScreen={true} />
            </motion.div>
        </div>
    );
};

export default ChatPage;

