import { Phone, MessageCircle, MapPin } from 'lucide-react';

const GullyToGloryCompact = () => {
    const handlePhoneCall = () => {
        window.open('tel:+918807775960', '_self');
    };

    const handleWhatsApp = () => {
        window.open('https://wa.me/918807775960?text=Hi%2C%20I%20am%20interested%20in%20Gully%20to%20Glory%20registration', '_blank');
    };

    const handleMapLink = () => {
        window.open('https://maps.app.goo.gl/7huc8B2WgPggbv3e8?g_st=iw', '_blank');
    };

    return (
        <div className="relative overflow-hidden bg-linear-to-br from-white via-purple-50 to-pink-50 rounded-xl border border-purple-200/60 p-2 mb-3 shadow-lg hover:shadow-xl transition-all duration-300">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-500/5 rounded-full blur-3xl animate-pulse delay-700" />
            <div className="absolute inset-0 bg-linear-to-br from-transparent via-white/20 to-transparent" />

            <div className="relative space-y-0.5">
                {/* Header */}
                <div className="relative text-center bg-white/80 backdrop-blur-md rounded-md py-0.5 px-2 border border-purple-100/50">
                    <h3 className="relative text-[11px] font-black uppercase tracking-widest text-[#006400]">
                        🏏 SSPL T10 TRIALS
                    </h3>
                </div>

                {/* Announcement - Ultra Compact */}
                <div className="bg-white/60 backdrop-blur-md rounded-md p-1 border border-purple-100/50">


                    <div className="flex items-center justify-center gap-1.5 py-0.5 px-2 bg-slate-50 rounded border border-slate-100 mb-1">
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">BENGALURU • APR 19 • THALASSERY • APR 26</span>
                    </div>

                    <div className="bg-linear-to-r from-sport-orange/10 to-purple-100/10 rounded py-1 px-2 border border-orange-200/30">
                        <p className="text-[9px] text-center font-black text-slate-800 uppercase leading-none">
                            ✨ Spot Registration Available ✨
                        </p>
                    </div>
                </div>

                {/* Contact Buttons - Minimalist */}
                <div className="flex gap-1 justify-center">
                    <button
                        onClick={handlePhoneCall}
                        className="flex items-center gap-1 bg-white text-green-600 px-2 py-0.5 rounded-full border border-green-200 transition-all hover:scale-105"
                        aria-label="Call us"
                    >
                        <Phone className="w-2.5 h-2.5" />
                        <span className="text-[7.5px] font-black uppercase">Call</span>
                    </button>

                    <button
                        onClick={handleWhatsApp}
                        className="flex items-center gap-1 bg-white text-[#128C7E] px-2 py-0.5 rounded-full border border-emerald-200 transition-all hover:scale-105"
                        aria-label="WhatsApp us"
                    >
                        <MessageCircle className="w-2.5 h-2.5" />
                        <span className="text-[7.5px] font-black uppercase">WhatsApp</span>
                    </button>
                    
                    <button
                        onClick={handleMapLink}
                        className="flex items-center gap-1 bg-white text-blue-600 px-2 py-0.5 rounded-full border border-blue-200 transition-all hover:scale-105"
                        aria-label="View on Map"
                    >
                        <MapPin className="w-2.5 h-2.5" />
                        <span className="text-[7.5px] font-black uppercase">Map</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GullyToGloryCompact;
