
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Gavel, Clock, Users, DollarSign, Trophy, MapPin, Activity } from 'lucide-react';
import selectedPlayers from '@/data/selectedPlayers.json';
import selectedPlayers2 from '@/data/selectedPlayers2.json';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const AuctionPage = () => {
    
    // Helper function to render a grid of players
    const renderPlayerGrid = (players: any[]) => (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {players.map((player, idx) => (
                <div key={idx} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 group hover:-translate-y-1">
                    <div className="h-[280px] relative overflow-hidden bg-gray-100">
                        {player.image ? (
                            <img 
                                src={player.image} 
                                alt={player.name}
                                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                                loading={idx < 8 ? "eager" : "lazy"}
                                decoding="async"
                                fetchPriority={idx < 4 ? "high" : "auto"}
                                style={{
                                    objectPosition: player.name === "SWAMINATHAN" ? "center 25%" : 
                                                    (player.name === "HIMANSHU HANS" || player.name === "GUMPARTHI NAVEEN") ? "center 40%" :
                                                    player.name.includes("BALAJI") ? "right top" : "top"
                                }}
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                <Trophy size={48} className="mb-3 opacity-30" />
                                <span className="text-xs font-semibold uppercase tracking-widest">No Photo</span>
                            </div>
                        )}

                    </div>
                    <div className="p-5 relative">
                        <h3 className="font-bold text-xl !text-gray-900 uppercase tracking-tight mb-3 group-hover:!text-primary transition-colors">
                            {player.name}
                        </h3>
                        <div className="flex flex-col gap-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            <span className="flex items-center gap-1.5">
                                <MapPin size={14} className="text-primary" /> {(player.location || "CHENNAI, IN").split(',').pop()?.trim()}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Activity size={14} className="text-primary" /> {player.role || "PLAYER"}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div 
            className="min-h-screen pt-20 pb-12 relative bg-cover bg-center bg-fixed"
            style={{ backgroundImage: "url('/assets/auction-bg-dark.png')" }}
        >
            {/* Dark semi-transparent overlay to keep text readable */}
            <div className="absolute inset-0 bg-[#0B132B]/85 z-0"></div>

            <Helmet>
                <title>SSPL T10 Player Auction 2026 | Live Updates & Sold Players</title>
                <meta name="description" content="Follow the SSPL T10 Player Auction. See realtime updates of sold players, team squads, and highest bids in India's premier tennis ball cricket league." />
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold font-bebas text-white drop-shadow-md mb-4">
                        SSPL T10 PLAYERS SELECTED FOR AUCTION
                    </h1>
                    <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                        The elite selection of talent ready to battle it out. Witness the strategy, the bids, and the making of SSPL T10 teams.
                    </p>
                </div>

                {/* List 1 */}
                <div className="mb-16">
                    <h2 className="text-2xl font-bold text-[#CCFF00] font-bebas mb-6 border-b border-white/20 pb-2">
                        LIST 1: 4TH & 5TH LEVEL SELECTED
                    </h2>
                    {renderPlayerGrid(selectedPlayers)}
                </div>

                {/* List 2 */}
                <div className="mb-16">
                    <h2 className="text-2xl font-bold text-[#CCFF00] font-bebas mb-6 border-b border-white/20 pb-2">
                        LIST 2: SECOND LIST FOR AUCTION
                    </h2>
                    {renderPlayerGrid(selectedPlayers2)}
                </div>

            </div>
        </div>
    );
};

export default AuctionPage;
