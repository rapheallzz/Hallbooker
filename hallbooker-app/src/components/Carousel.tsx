'use client';
import { useRef, useState, useEffect } from 'react';
import Slider, { ResponsiveObject } from 'react-slick';
import HallCard from './HallCard';
import NextArrow from './NextArrow';
import PrevArrow from './PrevArrow';
import { Hall } from '@/types/hall';

interface CarouselProps {
  halls: Hall[];
  slidesToShow?: number;
  responsive?: ResponsiveObject[];
  gridThreshold?: number;
}

const Carousel = ({
  halls,
  slidesToShow: propSlidesToShow,
  responsive: propResponsive,
}: CarouselProps) => {
  const sliderRef = useRef<Slider>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Default settings: 2 slides for mobile, 7 for desktop (>=1024px)
  // We use mobileFirst: false (default) which uses max-width breakpoints.
  const settings = {
    dots: false,
    speed: 500,
    slidesToScroll: 1,
    arrows: false,
    draggable: true,
    swipeToSlide: true,
    slidesToShow: propSlidesToShow || 7,
    infinite: halls.length > (propSlidesToShow || 7),
    responsive: propResponsive || [
      {
        breakpoint: 1023, // Matches 0px to 1023px
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          infinite: halls.length > 2,
        },
      },
    ],
  };

  const goToNext = () => {
    sliderRef.current?.slickNext();
  };

  const goToPrev = () => {
    sliderRef.current?.slickPrev();
  };

  // Threshold for showing a grid instead of a slider
  // If we have very few halls, a grid looks better.
  // On desktop, we want 7. On mobile, 2.
  // To keep it simple, we only show grid if halls.length is extremely small.
  if (halls.length === 0) return null;

  return (
    <div className="relative group" data-testid="carousel-container">
      {/* Show arrows if we have more halls than can be shown */}
      <div
        className={`absolute top-[-50px] right-0 space-x-2 z-10 ${
          halls.length <= 2
            ? 'hidden'
            : halls.length <= 7
              ? 'flex lg:hidden'
              : 'flex'
        }`}
      >
         <PrevArrow onClick={goToPrev} />
         <NextArrow onClick={goToNext} />
      </div>

      <div className="mx-[-8px]">
        {!isMounted ? (
          /* SSR Fallback: Grid that matches the expected slidesToShow */
          <div className="grid grid-cols-2 lg:grid-cols-7 gap-4 px-2">
            {halls.slice(0, 7).map((hall) => (
              <div key={hall._id} className="w-full">
                <HallCard hall={hall} />
              </div>
            ))}
          </div>
        ) : (
          /* Client-side: React Slick Slider */
          <Slider key={halls.length} ref={sliderRef} {...settings}>
            {halls.map((hall) => (
              <div key={hall._id} className="px-2 pb-4">
                <HallCard hall={hall} />
              </div>
            ))}
          </Slider>
        )}
      </div>
    </div>
  );
};

export default Carousel;
