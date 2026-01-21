'use client';
import { useRef, useState, useEffect } from 'react';
import Slider from 'react-slick';
import HallCard from './HallCard';
import NextArrow from './NextArrow';
import PrevArrow from './PrevArrow';
import { Hall } from '@/types/hall';

interface CarouselProps {
  halls: Hall[];
  slidesToShow?: number;
}

const Carousel = ({
  halls,
  slidesToShow: propSlidesToShow = 7,
}: CarouselProps) => {
  const sliderRef = useRef<Slider>(null);
  const [currentSlidesToShow, setCurrentSlidesToShow] = useState<number | null>(null);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setCurrentSlidesToShow(2);
      } else if (width < 1024) {
        setCurrentSlidesToShow(4);
      } else {
        setCurrentSlidesToShow(propSlidesToShow);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [propSlidesToShow]);

  const settings = {
    dots: false,
    speed: 500,
    slidesToScroll: 1,
    arrows: false,
    draggable: true,
    swipeToSlide: true,
    slidesToShow: currentSlidesToShow || propSlidesToShow,
    infinite: halls.length > (currentSlidesToShow || propSlidesToShow),
  };

  const goToNext = () => {
    sliderRef.current?.slickNext();
  };

  const goToPrev = () => {
    sliderRef.current?.slickPrev();
  };

  if (halls.length === 0) return null;

  return (
    <div className="relative group" data-testid="carousel-container">
      {/* Arrows: Controlled by CSS visibility and length-based logic */}
      <div className="absolute top-[-50px] right-0 space-x-2 z-10 flex">
        {/* Desktop Arrows: show only if length > propSlidesToShow on large screens */}
        <div className={halls.length > propSlidesToShow ? 'hidden lg:flex space-x-2' : 'hidden'}>
           <PrevArrow onClick={goToPrev} />
           <NextArrow onClick={goToNext} />
        </div>
        {/* Tablet/Large Mobile Arrows: show if length > 4 on medium screens */}
        <div className={halls.length > 4 ? 'hidden md:flex lg:hidden space-x-2' : 'hidden'}>
           <PrevArrow onClick={goToPrev} />
           <NextArrow onClick={goToNext} />
        </div>
        {/* Mobile Arrows: show if length > 2 on small screens */}
        <div className={halls.length > 2 ? 'flex md:hidden space-x-2' : 'hidden'}>
           <PrevArrow onClick={goToPrev} />
           <NextArrow onClick={goToNext} />
        </div>
      </div>

      <div className="mx-[-8px]">
        {!currentSlidesToShow ? (
          /* SSR & Initial Client Fallback: Grid that matches the responsive expected slidesToShow */
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 px-2">
            {halls.slice(0, 7).map((hall) => (
              <div key={hall._id} className="w-full">
                <HallCard hall={hall} />
              </div>
            ))}
          </div>
        ) : (
          /* Client-side: React Slick Slider - key depends on slidesToShow to force recalculation */
          <Slider key={`${halls.length}-${currentSlidesToShow}`} ref={sliderRef} {...settings}>
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
