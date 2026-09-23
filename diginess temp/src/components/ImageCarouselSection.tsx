import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';

const ImageCarouselSection = () => {
  // Sample images - replace with your attached image and other images
  const images = [
    {
      src: 'Explore the teams/Andra Pradesh.png',
      alt: 'Andhra Pradesh Team',
      title: 'Andhra Pradesh',
    },
    {
      src: 'Explore the teams/Karnataka.png',
      alt: 'Karnataka Team',
      title: 'Karnataka',
    },
    {
      src: 'Explore the teams/Kerala.png',
      alt: 'Kerala Team',
      title: 'Kerala',
    },
    {
      src: 'Explore the teams/Pudhucherry.png',
      alt: 'Puducherry Team',
      title: 'Puducherry',
    },
    {
      src: 'Explore the teams/Tamil Nadu.png',
      alt: 'Tamil Nadu Team',
      title: 'Tamil Nadu',
    },
    {
      src: 'Explore the teams/Telangana.png',
      alt: 'Telangana Team',
      title: 'Telangana',
    },
    // Add your attached image here
    // {
    //   src: "/path/to/attached-image.jpg",
    //   alt: "Attached Image",
    //   title: "Your Image Title"
    // }
  ];

  return (
    <section className="py-8 bg-linear-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Explore the Teams
          </h2>
          <p className="text-base text-gray-600 max-w-2xl mx-auto">
            Discover the participating teams from different states in the SSPL T10 tournament
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Carousel
            plugins={[
              Autoplay({
                delay: 3000,
              }),
            ]}
            className="w-full"
            opts={{
              align: 'start',
              loop: true,
            }}
          >
            <CarouselContent>
              {images.map((image, index) => {
                // Encode only spaces and special characters, preserve forward slashes
                const encodedSrc = image.src.replace(/ /g, '%20').replace(/'/g, '%27').replace(/"/g, '%22');

                return (
                  <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                    <div className="p-0.5">
                      <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                        <div className="aspect-square relative overflow-hidden rounded-t-lg">
                          <img
                            src={encodedSrc}
                            alt={image.alt}
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                            loading="lazy"
                            decoding="async"
                            fetchPriority="low"
                            width="400"
                            height="400"
                            onError={(e) => {
                              // Fallback for broken images
                              e.currentTarget.src = '/placeholder.svg';
                            }}
                          />
                        </div>
                        <div className="p-2 text-center">
                          <h3 className="text-sm font-semibold text-gray-900">{image.title}</h3>
                        </div>
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

export default ImageCarouselSection;