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
const DEFAULT_GRID_THRESHOLD = 4;

const Carousel = ({
  halls,
  slidesToShow = DEFAULT_SLIDES_TO_SHOW,
  responsive,
  gridThreshold
}: CarouselProps) => {
  const sliderRef = useRef<Slider>(null);

  // Determine how many slides to show, ensuring we don't try to show more than we have
  const actualSlidesToShow = Math.min(slidesToShow, halls.length);

  const defaultResponsive = [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: Math.min(actualSlidesToShow, 5),
        slidesToScroll: 1,
        infinite: halls.length > Math.min(actualSlidesToShow, 5),
        dots: false,
      },
    },
    {
      breakpoint: 768,
      settings: {
        slidesToShow: Math.min(actualSlidesToShow, 4),
        slidesToScroll: 1,
        infinite: halls.length > Math.min(actualSlidesToShow, 4),
      },
    },
    {
      breakpoint: 600,
      settings: {
        slidesToShow: Math.min(actualSlidesToShow, 3),
        slidesToScroll: 1,
        infinite: halls.length > Math.min(actualSlidesToShow, 3),
      },
    },
  ];

  const settings = {
    dots: false,
    infinite: halls.length > actualSlidesToShow,
    speed: 500,
    slidesToShow: actualSlidesToShow,
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


  // Use provided gridThreshold, or default to 4 for Home Page (7 slides),
  // or slidesToShow + 1 for other cases (to show carousel only when there's more than one page of slides)
  const actualGridThreshold = gridThreshold ?? (slidesToShow === DEFAULT_SLIDES_TO_SHOW ? DEFAULT_GRID_THRESHOLD : slidesToShow + 1);

  if (halls.length < actualGridThreshold) {
    const gridColsClass =
      halls.length === 1 ? 'grid-cols-1' :
      halls.length === 2 ? 'grid-cols-1 sm:grid-cols-2' :
      halls.length === 3 ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3' :
      'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';

    return (
      <div className={`grid ${gridColsClass} gap-4`}>
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
