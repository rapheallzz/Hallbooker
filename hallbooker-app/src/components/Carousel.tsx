'use client';
import { useRef } from 'react';
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

const DEFAULT_SLIDES_TO_SHOW = 7;

const Carousel = ({
  halls,
  slidesToShow = DEFAULT_SLIDES_TO_SHOW,
  responsive,
  gridThreshold
}: CarouselProps) => {
  const sliderRef = useRef<Slider>(null);

  // Use the intended slidesToShow instead of limiting by halls.length to maintain item size
  const baseSlidesToShow = slidesToShow;

  const defaultResponsive = [
    {
      breakpoint: 1280,
      settings: {
        slidesToShow: 7,
        slidesToScroll: 1,
      },
    },
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 5,
        slidesToScroll: 1,
      },
    },
    {
      breakpoint: 768,
      settings: {
        slidesToShow: 3,
        slidesToScroll: 1,
      },
    },
    {
      breakpoint: 640,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 1,
      },
    },
  ];

  const settings = {
    dots: false,
    infinite: halls.length > 2,
    speed: 500,
    slidesToShow: 2, // Start with 2 for mobile (mobileFirst)
    slidesToScroll: 1,
    arrows: false,
    mobileFirst: true, // Use mobile-first breakpoints
    responsive: responsive || defaultResponsive,
  };

  const goToNext = () => {
    sliderRef.current?.slickNext();
  };

  const goToPrev = () => {
    sliderRef.current?.slickPrev();
  };


  // Use provided gridThreshold, or default to slidesToShow + 1.
  // This ensures that if the items fit in one row, we use a left-aligned grid instead of a carousel.
  const actualGridThreshold = gridThreshold ?? (slidesToShow + 1);

  if (halls.length < actualGridThreshold) {
    // Maintain item size by using a grid that matches the carousel's visible slots at different breakpoints
    const gridColsClass =
      slidesToShow === DEFAULT_SLIDES_TO_SHOW
        ? 'grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7'
        : 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3';

    return (
      <div className={`grid ${gridColsClass} gap-4 overflow-hidden`}>
        {halls.map((hall) => (
          <HallCard key={hall._id} hall={hall} />
        ))}
      </div>
    );
  }

  return (
    <div className="relative">
      {halls.length > settings.slidesToShow && (
        <>
          <PrevArrow onClick={goToPrev} />
          <NextArrow onClick={goToNext} />
        </>
      )}
      <Slider ref={sliderRef} {...settings}>
        {halls.map((hall) => {
          return (
            <div key={hall._id} className="px-2">
              <HallCard key={hall._id} hall={hall} />
            </div>
          );
        })}
      </Slider>
    </div>
  );
};

export default Carousel;
