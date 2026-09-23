import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, ArrowUpRight, Plane, Train, Bus, CheckCircle2, Phone, Share2 } from 'lucide-react';

const UpcomingTrialsCards: React.FC = () => {
  const handleShare = async () => {
    const text = 'SSPL T10 Chennai Trials on 18th July 2026 at Nexus Sports Arena. Register now at ssplt10.co.in';
    if (navigator.share) {
      try {
        await navigator.share({ title: 'SSPL T10 Chennai Trials', text, url: 'https://ssplt10.co.in/register' });
      } catch {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(text);
    }
  };

  return (
    <section className="py-24 md:py-32 bg-[#0047AB] relative overflow-hidden" id="upcoming-trials">
      {/* Custom Background Texture & Cobalt Overlay */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url("/assets/trials-bg-texture-v2.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="absolute inset-0 bg-[#001B69]/90" />
      </div>

      {/* Radiant Background Gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -right-24 w-[600px] h-[600px] bg-sky-400/20 blur-[120px] rounded-full" />
        <div className="absolute -bottom-24 -left-24 w-[600px] h-[600px] bg-[#7000FF]/15 blur-[120px] rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)]" />
      </div>

      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        {/* Title */}
        <div className="mb-12 md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="text-center"
          >
            <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-8 mb-10">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tighter font-heading whitespace-nowrap">
                CHENNAI <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-[#7000FF]">TRIALS</span>
              </h2>
              
              <div className="flex flex-wrap justify-center items-center gap-4 text-white/90 font-bold text-lg md:text-xl">
                <div className="flex items-center gap-2 bg-white/5 px-5 py-3 rounded-xl border border-white/10 shadow-lg">
                  <Calendar className="w-5 h-5 text-[#00E5FF]" />
                  <span className="whitespace-nowrap">18th July 2026</span>
                </div>
                <div className="flex items-center gap-2 bg-white/5 px-5 py-3 rounded-xl border border-white/10 shadow-lg">
                  <MapPin className="w-5 h-5 text-[#FF4D00]" />
                  <span className="whitespace-nowrap">Nexus Sports Arena</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden border border-white/20"
        >
          {/* Decorative element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#00E5FF]/10 to-transparent rounded-bl-full pointer-events-none" />

          <div className="flex flex-col lg:flex-row gap-10 relative z-10">
            {/* Left Column: Venue & Actions */}
            <div className="lg:w-1/3 flex flex-col gap-6">
              <div className="bg-blue-50 p-6 rounded-2xl border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-black text-2xl mb-4 !text-black flex items-center gap-2">
                  <MapPin className="w-6 h-6" /> Venue Details
                </h3>
                <p className="font-bold text-xl !text-black mb-2">Nexus Sports Arena</p>
                <p className="!text-black leading-relaxed mb-6 font-medium">
                  232/272, Avvai Shanmugam Salai, Azad Nagar, Royapettah, Chennai – 600014
                </p>
                <a 
                  href="https://www.google.com/maps/search/?api=1&query=Nexus+Sports+Arena,+Royapettah,+Chennai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 rounded-xl font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-950 !text-white transition-colors shadow-md hover:shadow-lg"
                >
                  <MapPin className="w-4 h-4" /> Open in Google Maps
                </a>
              </div>

              <div className="bg-gradient-to-r from-[#0047AB] to-[#001B69] !text-white p-6 rounded-2xl shadow-lg">
                <h3 className="font-black text-xl mb-3 flex items-center gap-2">
                  <Phone className="w-6 h-6" /> Assistance
                </h3>
                <p className="!text-white/90 font-medium text-lg">WhatsApp Support:{' '}
                  <a href="https://wa.me/918807775960" target="_blank" rel="noopener noreferrer" className="font-black !text-white hover:!text-[#00E5FF] transition-colors bg-white/10 px-3 py-1 rounded-lg inline-block mt-2 md:mt-0 md:ml-2">
                    88077 75960
                  </a>
                </p>
                <p className="mt-4 text-sm !text-white/80 italic leading-relaxed">
                  We look forward to seeing you at the SSPL Technical & Simulation Level Trials. Travel safely and all the best for your performance! 🏏
                </p>
              </div>

              <div className="flex gap-3 mt-auto">
                <motion.a
                  href="/register"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-4 rounded-xl font-black uppercase tracking-wider text-sm flex items-center justify-center gap-2 bg-[#00E5FF] hover:bg-[#00cce6] transition-colors !text-[#001B69] shadow-lg shadow-[#00E5FF]/20"
                >
                  <span>Register Now</span>
                  <ArrowUpRight className="w-4 h-4" />
                </motion.a>
                <button
                  onClick={handleShare}
                  className="px-4 py-4 rounded-xl bg-gray-100 hover:bg-gray-200 !text-gray-700 transition-colors flex items-center justify-center shadow-sm"
                  title="Share"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Right Column: Travel Guide & Checklist */}
            <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-8 !text-black">
              
              {/* Train and Bus block */}
              <div className="space-y-8">
                <div className="space-y-4">
                  <h3 className="font-black text-xl !text-blue-900 flex items-center gap-3 border-b-2 border-gray-200 pb-3">
                    <Train className="w-6 h-6 !text-orange-600" /> Arriving by Train
                  </h3>
                  <div className="space-y-5">
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                      <h4 className="font-bold !text-black mb-2">1. Chennai Central (Approx. 6 km)</h4>
                      <ul className="space-y-2 text-sm !text-black">
                        <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 flex-shrink-0" /> <p><span className="font-bold !text-blue-900">Taxi/Cab:</span> 20–30 mins</p></li>
                        <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 flex-shrink-0" /> <p><span className="font-bold !text-blue-900">Metro:</span> Take Metro to Govt Estate Station. Then auto/cab (10–15 mins).</p></li>
                        <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 flex-shrink-0" /> <p><span className="font-bold !text-blue-900">Auto:</span> Available outside.</p></li>
                      </ul>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                      <h4 className="font-bold !text-black mb-2">2. Chennai Egmore (Approx. 4 km)</h4>
                      <ul className="space-y-2 text-sm !text-black">
                        <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 flex-shrink-0" /> <p><span className="font-bold !text-blue-900">Taxi/Cab:</span> 15–20 mins</p></li>
                        <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 flex-shrink-0" /> <p><span className="font-bold !text-blue-900">Auto:</span> Easily available</p></li>
                        <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 flex-shrink-0" /> <p><span className="font-bold !text-blue-900">Bus:</span> MTC buses towards Royapettah/Mylapore.</p></li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-black text-xl !text-blue-900 flex items-center gap-3 border-b-2 border-gray-200 pb-3">
                    <Bus className="w-6 h-6 !text-orange-600" /> By City Bus
                  </h3>
                  <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                    <p className="!text-black text-sm font-medium leading-relaxed">
                      Buses connecting <span className="font-bold !text-blue-900">Royapettah, Mylapore, Teynampet, Adyar</span>, and <span className="font-bold !text-blue-900">Central Chennai</span> stop within walking distance or a short auto ride from the venue.
                    </p>
                  </div>
                </div>
              </div>

              {/* Flight and Checklist block */}
              <div className="space-y-8">
                <div className="space-y-4">
                  <h3 className="font-black text-xl !text-blue-900 flex items-center gap-3 border-b-2 border-gray-200 pb-3">
                    <Plane className="w-6 h-6 !text-orange-600" /> Arriving by Flight
                  </h3>
                  <div className="bg-purple-50 p-5 rounded-xl border border-purple-200">
                    <h4 className="font-bold !text-black mb-4 pb-2 border-b border-purple-200">Chennai International Airport (18 km)</h4>
                    <div className="space-y-4 !text-black">
                      <div>
                        <span className="font-bold !text-blue-900 flex items-center gap-2 mb-1">
                          <span className="bg-blue-900 !text-white w-5 h-5 rounded-full inline-flex items-center justify-center text-xs">1</span> 
                          Taxi/Cab (Recommended)
                        </span>
                        <p className="text-sm !text-black pl-7 font-medium">Travel Time: 40–60 mins (depending on traffic)</p>
                      </div>
                      <div>
                        <span className="font-bold !text-blue-900 flex items-center gap-2 mb-2">
                          <span className="bg-blue-900 !text-white w-5 h-5 rounded-full inline-flex items-center justify-center text-xs">2</span> 
                          Metro
                        </span>
                        <ul className="space-y-1.5 text-sm !text-black pl-7">
                          <li className="flex items-start gap-2"><span className="!text-purple-600 font-bold mt-0.5">•</span> Board Metro from Airport Station.</li>
                          <li className="flex items-start gap-2"><span className="!text-purple-600 font-bold mt-0.5">•</span> Get down at Government Estate Station.</li>
                          <li className="flex items-start gap-2"><span className="!text-purple-600 font-bold mt-0.5">•</span> Take auto/cab to Nexus Sports Arena (10–15 mins).</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-black text-xl !text-blue-900 flex items-center gap-3 border-b-2 border-gray-200 pb-3">
                    <CheckCircle2 className="w-6 h-6 !text-green-600" /> Before You Travel
                  </h3>
                  <div className="bg-green-50 p-5 rounded-xl border border-green-200">
                    <ul className="space-y-3.5">
                      {[
                        'Carry your SSPL registration confirmation.',
                        'Reach the venue at least 30–45 minutes before reporting time.',
                        'Wear appropriate cricket attire and sports shoes.',
                        'Bring your own bat, gloves, and personal gear if applicable.',
                        'Keep a valid ID proof handy.',
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3 !text-black font-medium text-sm">
                          <CheckCircle2 className="w-5 h-5 !text-green-600 flex-shrink-0" />
                          <span className="leading-tight">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default UpcomingTrialsCards;
