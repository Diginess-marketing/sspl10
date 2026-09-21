import React from 'react';
import { Phone, Clock, MessageCircle } from 'lucide-react';

const FAQContactSection = () => {
  const faqs = [
    {
      q: "How to register for SSPL T10?",
      a: "You can register online through our official website by clicking on the 'Register Now' button and filling in your details."
    },
    {
      q: "Where will the city trials be held?",
      a: "City trials are held across major cities in India. You can find the full schedule in the 'Trials' section of our website."
    },
    {
      q: "What is the age limit for participation?",
      a: "The SSPL T10 is open to players from various age groups. Specific category details are available during the registration process."
    }
  ];

  return (
    <section className="bg-white py-16 md:py-24 overflow-hidden relative border-t border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-12 items-stretch">
          
          {/* FAQ Preview Side */}
          <div className="lg:w-1/2">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl md:text-3xl font-black text-[#001b69] font-heading uppercase tracking-wider flex items-center gap-3">
                <span className="w-8 h-1 bg-[#CCFF00] rounded-full"></span>
                FAQ Preview
              </h3>
              <a 
                href="/faqs" 
                className="text-sm font-bold text-[#001b69] hover:text-[#0047AB] transition-colors flex items-center gap-1 group"
              >
                VIEW ALL
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </a>
            </div>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="group border-b border-gray-100 pb-6 last:border-0">
                  <h4 className="text-lg font-bold text-[#001b69] mb-2 group-hover:text-[#0047AB] transition-colors">
                    {faq.q}
                  </h4>
                  <p className="text-gray-600 leading-relaxed italic">
                    "{faq.a}"
                  </p>
                </div>
              ))}
              <div className="pt-4">
                <a 
                  href="/faqs" 
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#001b69] hover:bg-[#002896] text-[#CCFF00] font-black uppercase tracking-widest text-sm rounded-xl transition-all group w-full md:w-auto shadow-[0_10px_30px_rgba(0,27,105,0.2)]"
                >
                  VIEW ALL QUESTIONS
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </a>
              </div>
            </div>
          </div>

          {/* Contact Support Block (Based on User Image) */}
          <div className="lg:w-1/2 flex flex-col md:flex-row bg-[#001b69] rounded-3xl overflow-hidden shadow-[0_30px_60px_rgba(0,27,105,0.25)] relative group">
            {/* Left Side: ANY QUESTIONS */}
            <div className="md:w-1/3 bg-[#002896] p-8 flex items-center justify-center relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-br from-[#001b69] to-transparent opacity-50"></div>
               <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white font-heading uppercase tracking-tighter text-center md:-rotate-90 md:whitespace-nowrap z-10 drop-shadow-2xl">
                ANY QUESTIONS
              </h2>
            </div>
            
            {/* Right Side: Details */}
            <div className="md:w-2/3 p-8 md:p-12 flex flex-col justify-center text-white relative z-10">
              <div className="mb-8">
                <h3 className="text-2xl md:text-3xl font-black text-[#CCFF00] font-heading uppercase tracking-wider mb-2">
                  CONTACT SSPL SUPPORT
                </h3>
                <div className="h-1 w-20 bg-white/20 rounded-full mb-6"></div>
                <p className="text-white/80 text-lg leading-relaxed font-medium">
                  Have questions about SSPL trials, registration, or participation? 
                  Our team is here to help.
                </p>
              </div>

              <div className="space-y-8">
                {/* Customer Care */}
                <div className="flex items-start gap-4 group/item">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center group-hover/item:bg-[#CCFF00] transition-colors duration-500">
                    <Phone className="w-6 h-6 text-[#CCFF00] group-hover/item:text-[#001b69] transition-colors duration-500" />
                  </div>
                  <div>
                    <label className="text-white/50 text-xs font-bold uppercase tracking-widest block mb-1">CUSTOMER CARE NUMBER</label>
                    <span className="text-xl md:text-2xl font-black tracking-tight text-white">+91 880 777 5960</span>
                  </div>
                </div>

                {/* Working Hours */}
                <div className="flex items-start gap-4 group/item">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center group-hover/item:bg-[#CCFF00] transition-colors duration-500">
                    <Clock className="w-6 h-6 text-[#CCFF00] group-hover/item:text-[#001b69] transition-colors duration-500" />
                  </div>
                  <div>
                    <label className="text-white/50 text-xs font-bold uppercase tracking-widest block mb-1">Working Hours:</label>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white/90">Monday – Saturday</span>
                      <span className="text-xl font-black text-[#CCFF00]">11 AM – 8 PM</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button 
                onClick={() => window.open('https://wa.me/918807775960', '_blank')}
                className="mt-10 flex items-center justify-center gap-2 bg-[#CCFF00] text-[#001b69] px-8 py-4 rounded-xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_10px_30px_rgba(204,255,0,0.3)]"
              >
                <MessageCircle className="w-5 h-5" />
                Chat on WhatsApp
              </button>
            </div>

            {/* Background elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#CCFF00]/5 rounded-full blur-3xl -ml-24 -mb-24 pointer-events-none"></div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default FAQContactSection;
