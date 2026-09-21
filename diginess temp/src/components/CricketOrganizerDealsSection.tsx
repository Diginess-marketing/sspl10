import React from 'react';
import { Trophy, Package, Smartphone, ShoppingBag, Truck, Download, Play, Star, Zap, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import './CricketOrganizerDealsSection.css';

const CricketOrganizerDealsSection = () => {
  return (
    <section className="py-3 relative overflow-hidden">
      {/* Animated Background Elements - Reduced */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-5 left-5 w-12 h-12 bg-yellow-300 rounded-full animate-bounce"></div>
        <div className="absolute top-10 right-10 w-8 h-8 bg-green-300 rounded-full animate-pulse"></div>
        <div className="absolute bottom-10 left-1/4 w-6 h-6 bg-lime-300 rounded-full animate-ping"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Compact Header */}
        <div className="text-center mb-2">
          <div className="inline-flex items-center gap-1 bg-yellow-500 px-3 py-1 rounded-full text-xs font-bold mb-2 shadow-lg text-white">
            <Zap className="w-3 h-3 animate-spin" />
            <span>LIMITED TIME SPECIAL</span>
          </div>
          <h2 className="section-title text-xl md:text-2xl font-black mb-2 text-slate-900">
            Buy Official SSPL Match Ball – SiXiT Tennis Ball
          </h2>
          <p className="section-subtitle text-sm text-green-700">Premium quality tennis balls trusted by professionals!</p>
        </div>

        {/* Compact Grid Layout */}
        <div className="max-w-5xl mx-auto mb-6 space-y-4">
          {/* Original Deal Section */}
          <div className="rounded-xl p-4 transition-shadow">
            {/* Merged Content */}
            <div className="space-y-2">
              {/* Benefits Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                <div className="text-center text-xs">
                  <p className="font-bold text-slate-800">✅ 150 FREE Balls</p>
                </div>
                <div className="text-center text-xs">
                  <p className="font-bold text-slate-800">✅ FREE Stickers</p>
                </div>
                <div className="text-center text-xs">
                  <p className="font-bold text-slate-800">✅ Complete Deal</p>
                </div>
                <div className="text-center text-xs">
                  <p className="font-bold text-slate-800">✅ Free Delivery</p>
                </div>
              </div>

              {/* Title and CTA Section */}
              <div className="text-center bg-green-600 text-white p-3 rounded-lg">
                <h3 className="text-sm md:text-base font-bold mb-2">
                  🏆 Special Combo – Limited Time Only!
                </h3>
                <p className="text-xs mb-2">How to Grab the Deal:</p>
                <Button
                  size="sm"
                  className="bg-white hover:bg-yellow-50 px-3 py-1.5 text-xs font-bold rounded shadow-lg transform hover:scale-105 transition-all w-full mb-1.5 !text-black"
                  onClick={() => window.open('https://sportsal.com/download', '_blank')}
                >
                  <Download className="w-3 h-3 mr-1 shrink-0" />
                  <span style={{ color: 'black' }}>📲 Download Sportsal App</span>
                </Button>
                <p className="text-yellow-100 text-xs">👉 sportsal.com/download</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stay Updated - Compact */}
        <div className="text-center">
          <h3 className="text-sm font-bold text-[#C1E303] mb-2">📢 Stay Updated:</h3>
          <div className="flex flex-col sm:flex-row justify-center gap-2">
            <a
              href="https://www.instagram.com/sixitsports"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1 bg-yellow-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:shadow-lg transform hover:scale-105 transition-all"
            >
              Follow SiXiT @sixitsports
            </a>
            <a
              href="https://www.instagram.com/sportsal4u"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:shadow-lg transform hover:scale-105 transition-all"
            >
              Follow Sportsal @sportsal4u
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CricketOrganizerDealsSection;