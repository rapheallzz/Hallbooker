'use client';
import { useRef } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import HallCard from './HallCard';
import NextArrow from './NextArrow';
import PrevArrow from './PrevArrow';
import { Hall } from '@/types/hall';

interface CarouselProps {
  halls: Hall[];
}

const Carousel = ({ halls }: CarouselProps) => {
  const sliderRef = useRef<Slider>(null);

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 7,
    slidesToScroll: 1,
    arrows: false, // We are using custom arrows outside the slider
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 5,
          slidesToScroll: 1,
          infinite: true,
          dots: false,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
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


  // If there are fewer than 4 halls, render a simple grid instead of a carousel
  if (halls.length < 4) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {halls.map((hall) => (
          <HallCard key={hall._id} hall={hall} />
        ))}
      </div>
    );
  }

  return (
    <div className="relative">
      <PrevArrow onClick={goToPrev} />
      <NextArrow onClick={goToNext} />
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
