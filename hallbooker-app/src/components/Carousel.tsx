'use client';
import { useRef } from 'react';
import Slider, { ResponsiveObject } from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
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
      breakpoint: 1279, // Match Tailwind xl breakpoint (below 1280px)
      settings: {
        slidesToShow: 5,
        slidesToScroll: 1,
        infinite: halls.length > 5,
        dots: false,
      },
    },
    {
      breakpoint: 1023, // Match Tailwind lg breakpoint (below 1024px)
      settings: {
        slidesToShow: 4,
        slidesToScroll: 1,
        infinite: halls.length > 4,
      },
    },
    {
      breakpoint: 767, // Match Tailwind md breakpoint (below 768px)
      settings: {
        slidesToShow: 2,
        slidesToScroll: 1,
        infinite: halls.length > 2,
      },
    },
    {
      breakpoint: 639, // Match Tailwind sm breakpoint (below 640px)
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
        infinite: halls.length > 1,
      },
    },
  ];

  const settings = {
    dots: false,
    infinite: halls.length > baseSlidesToShow,
    speed: 500,
    slidesToShow: baseSlidesToShow,
    slidesToScroll: 1,
    arrows: false, // We are using custom arrows outside the slider
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
        ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7'
        : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3';

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
