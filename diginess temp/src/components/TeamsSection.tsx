import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface TeamData {
  id: number;
  name: string;
  region: string;
  image: string;
  players: number;
  achievements: string;
  description: string;
}

const TeamsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const teams: TeamData[] = [
    {
      id: 1,
      name: 'Mumbai Mavericks',
      region: 'Maharashtra',
      image: '/api/placeholder/400/300',
      players: 15,
      achievements: '3-Time Champions',
      description: 'Dominant force from the heart of Maharashtra',
    },
    {
      id: 2,
      name: 'Bangalore Blasters',
      region: 'Karnataka',
      image: '/api/placeholder/400/300',
      players: 18,
      achievements: 'Runners-up 2023',
      description: 'Tech-savvy team with innovative strategies',
    },
    {
      id: 3,
      name: 'Delhi Dynamos',
      region: 'Delhi NCR',
      image: '/api/placeholder/400/300',
      players: 16,
      achievements: 'Semi-finalists',
      description: "Capital's pride with unmatched determination",
    },
    {
      id: 4,
      name: 'Chennai Champions',
      region: 'Tamil Nadu',
      image: '/api/placeholder/400/300',
      players: 14,
      achievements: 'Fair Play Award',
      description: 'Southern champions with traditional values',
    },
    {
      id: 5,
      name: 'Pune Panthers',
      region: 'Maharashtra',
      image: '/api/placeholder/400/300',
      players: 17,
      achievements: 'Rising Stars',
      description: "Emerging talent from Pune's cricket culture",
    },
    {
      id: 6,
      name: 'Hyderabad Hurricanes',
      region: 'Telangana',
      image: '/api/placeholder/400/300',
      players: 19,
      achievements: 'Best Bowling Attack',
      description: "Deccan plateau's fierce competitors",
    },
  ];

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === teams.length - 1 ? 0 : prevIndex + 1,
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? teams.length - 1 : prevIndex - 1,
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 4000);

    return () => clearInterval(interval);
  }, [currentIndex, isAutoPlaying]);

  // Pause auto-play on hover
  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  return (
    <section className="py-grid-4 bg-linear-to-br from-gray-50 to-white relative overflow-hidden">
      {/* RE-ENABLE: To re-enable teams feature, uncomment the original carousel content below and remove the fallback */}
      {/*
      <div className="container mx-auto px-grid-2 relative z-10">
        <div className="text-center mb-grid-3">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-grid-2">
            EXPLORE THE TEAMS AND TALENT REPRESENTING EACH REGION
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover the diverse talent and regional pride that makes SSPL T10 a celebration of cricket across India
          </p>
        </div>

        <div className="relative max-w-6xl mx-auto">
          <div className="relative overflow-hidden rounded-2xl shadow-2xl">
            <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
              {teams.map((team) => (
                <div key={team.id} className="w-full shrink-0">
                  <div className="relative h-96 md:h-[500px]">
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${team.image})`, backgroundColor: '#f3f4f6' }}>
                      <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/50 to-transparent"></div>
                    </div>
                    <div className="relative h-full flex items-center">
                      <div className="container mx-auto px-6 md:px-12">
                        <div className="max-w-lg">
                          <div className="flex items-center gap-2 mb-3">
                            <MapPin className="w-5 h-5 text-cricket-yellow" />
                            <span className="text-cricket-yellow font-semibold text-sm uppercase tracking-wide">{team.region}</span>
                          </div>
                          <h3 className="text-3xl md:text-4xl font-bold text-white mb-3">{team.name}</h3>
                          <p className="text-gray-200 text-lg mb-grid-2">{team.description}</p>
                          <div className="flex flex-wrap gap-4 mb-grid-3">
                            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2">
                              <Users className="w-4 h-4 text-cricket-yellow" />
                              <span className="text-white text-sm font-medium">{team.players} Players</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2">
                              <Trophy className="w-4 h-4 text-cricket-yellow" />
                              <span className="text-white text-sm font-medium">{team.achievements}</span>
                            </div>
                          </div>
                          <Button className="bg-cricket-yellow text-black hover:bg-cricket-yellow/90 font-semibold px-6 py-3" size="lg">
                            View Team Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Button variant="outline" size="icon" className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg border-0 w-12 h-12" onClick={prevSlide}>
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </Button>
          <Button variant="outline" size="icon" className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg border-0 w-12 h-12" onClick={nextSlide}>
            <ChevronRight className="w-6 h-6 text-gray-700" />
          </Button>
          <div className="flex justify-center mt-6 gap-2">
            {teams.map((_, index) => (
              <button key={index} className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentIndex ? 'bg-cricket-yellow scale-125' : 'bg-gray-300 hover:bg-gray-400'}`} onClick={() => goToSlide(index)} aria-label={`Go to slide ${index + 1}`} />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
          <Card className="text-center p-6 border-0 shadow-lg bg-linear-to-br from-cricket-blue to-cricket-dark-blue text-white">
            <CardContent className="p-0">
              <div className="text-3xl font-bold mb-2">6</div>
              <div className="text-sm opacity-90">Regions</div>
            </CardContent>
          </Card>
          <Card className="text-center p-6 border-0 shadow-lg bg-linear-to-br from-cricket-yellow to-yellow-600 text-black">
            <CardContent className="p-0">
              <div className="text-3xl font-bold mb-2">99</div>
              <div className="text-sm opacity-90">Total Players</div>
            </CardContent>
          </Card>
          <Card className="text-center p-6 border-0 shadow-lg bg-linear-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-0">
              <div className="text-3xl font-bold mb-2">15+</div>
              <div className="text-sm opacity-90">Matches Played</div>
            </CardContent>
          </Card>
          <Card className="text-center p-6 border-0 shadow-lg bg-linear-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-0">
              <div className="text-3xl font-bold mb-2">3</div>
              <div className="text-sm opacity-90">Championships</div>
            </CardContent>
          </Card>
        </div>
      </div>
      */}

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 md:opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 bg-cricket-blue rounded-full"></div>
        <div className="absolute bottom-10 right-10 w-16 h-16 bg-cricket-yellow rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-cricket-purple rounded-full"></div>
      </div>

      {/* Cricket SVGs at edges - Hidden on mobile, partial on tablet, full on desktop */}
      <img
        src="/assets/svg/bat-stroke.svg"
        alt="Cricket bat stroke decoration"
        className="hidden md:block absolute top-4 left-4 w-16 h-16 opacity-5 lg:opacity-10"
        aria-hidden="true"
        loading="lazy"
      />
      <img
        src="/assets/svg/ball-trail.svg"
        alt="Cricket ball trail decoration"
        className="hidden md:block absolute bottom-4 right-4 w-16 h-16 opacity-5 lg:opacity-10"
        aria-hidden="true"
        loading="lazy"
      />

      <div className="container mx-auto px-grid-2 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-grid-3">
          <h2 className="text-headline font-bold text-gray-900 mb-grid-2" style={{ fontFamily: 'var(--font-heading)' }}>
            TEAMS FEATURE TEMPORARILY UNAVAILABLE
          </h2>
          <p className="text-body font-body text-gray-600 max-w-2xl mx-auto">
            The teams section is currently under maintenance. We apologize for the inconvenience and will restore this feature soon.
          </p>
        </div>

        {/* Fallback Content */}
        <div className="max-w-4xl mx-auto text-center">
          <Card className="p-grid-2 border-0 shadow-lg bg-linear-to-br from-gray-100 to-gray-200">
            <CardContent className="p-0">
              <div className="text-6xl mb-grid-2">🏏</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-grid-2">Coming Back Soon!</h3>
              <p className="text-gray-600 mb-grid-3">
                We're working hard to bring you the best teams experience. Check back later for updates on regional teams and player information.
              </p>
              <div className="text-sm text-gray-500">
                Expected restoration: Once backend services are deployed
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default TeamsSection;