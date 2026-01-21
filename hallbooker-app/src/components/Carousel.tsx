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

  const defaultResponsive = [
    {
      breakpoint: 1280,
      settings: {
        slidesToShow: 6,
        slidesToScroll: 1,
      },
    },
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 4,
        slidesToScroll: 1,
      },
    },
    {
      breakpoint: 768,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 1,
      },
    },
    {
      breakpoint: 480,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 1,
      },
    },
  ];

  const settings = {
    dots: false,
    infinite: halls.length > slidesToShow,
    speed: 500,
    slidesToShow: slidesToShow,
    slidesToScroll: 1,
    arrows: false,
    draggable: true,
    swipeToSlide: true,
    responsive: responsive || defaultResponsive,
  };

  const goToNext = () => {
    sliderRef.current?.slickNext();
  };

  const goToPrev = () => {
    sliderRef.current?.slickPrev();
  };

  // If we have few items, show them in a grid instead of a carousel
  const actualGridThreshold = gridThreshold ?? 3;

  if (halls.length < actualGridThreshold) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {halls.map((hall) => (
          <div key={hall._id} className="w-full">
            <HallCard hall={hall} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="relative group">
      {halls.length > 2 && (
        <>
           <PrevArrow onClick={goToPrev} />
           <NextArrow onClick={goToNext} />
        </>
      )}
      <div className="mx-[-8px]">
        <Slider ref={sliderRef} {...settings}>
          {halls.map((hall) => (
            <div key={hall._id} className="px-2 pb-4">
              <HallCard hall={hall} />
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default Carousel;
