import React from 'react';
import { Trophy, Users, Globe, Building2, Calendar } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import './LeagueHighlightsSection.css';

const LeagueHighlightsSection = () => {
  const highlights = [
    {
      type: 'image',
      image: '/image_8.png',
      title: 'Celeb Patron',
      description: '',
    },
    {
      icon: Globe,
      title: '6 States',
      description: '',
    },
    {
      icon: Building2,
      title: '12 Franchisees',
      description: '',
    },
    {
      icon: Trophy,
      title: "Final's at Sharjah",
      description: '',
    },
    {
      icon: Calendar,
      title: '4 Weeks',
      description: '',
    },
    {
      icon: Users,
      title: '500 Players',
      description: '',
    },
  ];

  return (
    <section className="py-6 bg-linear-to-br from-cricket-blue via-cricket-dark-blue to-cricket-purple text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-black mb-2 bg-linear-to-r from-white to-yellow-300 bg-clip-text text-transparent">
            League Highlights
          </h2>
          <p className="text-sm md:text-base text-gray-100 max-w-2xl mx-auto leading-relaxed font-medium">
            Discover the excitement of SSPL T10 - where cricket meets championship glory!
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Carousel
            plugins={[
              Autoplay({
                delay: 4000,
              }),
            ]}
            className="w-full"
            opts={{
              align: 'start',
              loop: true,
            }}
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {highlights.map((highlight, index) => {
                if (highlight.type === 'image') {
                  return (
                    <CarouselItem key={index} className="pl-1 md:pl-2 md:basis-1/2 lg:basis-1/3">
                      <div className="group bg-white/10 backdrop-blur-sm rounded-md p-1.5 hover:bg-white/20 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-xl border border-white/20 mx-auto">
                        <div className="flex flex-col items-center justify-center">
                          <img
                            src={highlight.image}
                            alt={highlight.title}
                            className="w-full max-w-none h-auto object-contain rounded-md league-highlights-image"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder.svg';
                            }}
                          />
                        </div>
                      </div>
                    </CarouselItem>
                  );
                }

                const IconComponent = highlight.icon;
                if (!IconComponent) return null;

                return (
                  <CarouselItem key={index} className="pl-1 md:pl-2 md:basis-1/2 lg:basis-1/3">
                    <div className="group bg-white/10 backdrop-blur-sm rounded-md p-1.5 hover:bg-white/20 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-xl border border-white/20 aspect-square max-w-28 mx-auto">
                      <div className="flex flex-col items-center justify-center text-center space-y-1 h-full">
                        <div className="bg-linear-to-br from-yellow-400 to-sport-orange rounded-full p-1.5 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                          {React.createElement(IconComponent, { className: 'w-4 h-4 text-white' })}
                        </div>
                        <h3 className="text-sm font-bold text-white group-hover:text-yellow-300 transition-colors duration-300 leading-tight">
                          {highlight.title}
                        </h3>
                        <p className="text-gray-200 text-xs leading-tight">
                          {highlight.description}
                        </p>
                      </div>
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>
        </div>

      </div>
    </section>
  );
};

export default LeagueHighlightsSection;