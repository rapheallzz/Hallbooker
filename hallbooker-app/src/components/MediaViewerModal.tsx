'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import '../app/custom.css';
import { X } from 'lucide-react';
import NextArrow from './NextArrow';
import PrevArrow from './PrevArrow';

interface MediaViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  media: string[];
  startIndex: number;
}

const MediaViewerModal = ({ isOpen, onClose, media, startIndex }: MediaViewerModalProps) => {
  const sliderRef = useRef<Slider>(null);

  useEffect(() => {
    if (isOpen && sliderRef.current) {
      sliderRef.current.slickGoTo(startIndex);
    }
  }, [isOpen, startIndex]);

  if (!isOpen) {
    return null;
  }

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    initialSlide: startIndex,
    arrows: false,
  };

  const isVideo = (url: string) => {
    return /\.(mp4|webm|ogg)$/i.test(url);
  };

  const goToNext = () => {
    sliderRef.current?.slickNext();
  };

  const goToPrev = () => {
    sliderRef.current?.slickPrev();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white z-50"
      >
        <X size={32} />
      </button>

      <div className="relative w-full max-w-4xl">
        <PrevArrow onClick={goToPrev} />
        <NextArrow onClick={goToNext} />
        <Slider ref={sliderRef} {...settings}>
          {media.map((url, index) => (
            <div key={index} className="flex justify-center items-center h-screen">
              <div className="relative w-full h-full max-h-[80vh] flex items-center justify-center">
                {isVideo(url) ? (
                  <video
                    src={url}
                    controls
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <Image
                    src={url}
                    alt={`Media ${index + 1}`}
                    fill
                    className="object-contain"
                    sizes="100vw"
                  />
                )}
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default MediaViewerModal;
