'use client';

import { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface MediaViewerProps {
  media: { url: string; type: 'image' | 'video' }[];
  initialIndex: number;
  onClose: () => void;
}

const MediaViewer: React.FC<MediaViewerProps> = ({ media, initialIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? media.length - 1 : prevIndex - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === media.length - 1 ? 0 : prevIndex + 1));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
      <div className="relative w-full h-full">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white z-10"
        >
          <X size={32} />
        </button>

        <button
          onClick={handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white z-10"
        >
          <ChevronLeft size={48} />
        </button>

        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white z-10"
        >
          <ChevronRight size={48} />
        </button>

        <div className="flex items-center justify-center h-full">
          {media[currentIndex].type === 'image' ? (
            <img
              src={media[currentIndex].url}
              alt="Hall media"
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <video
              src={media[currentIndex].url}
              controls
              autoPlay
              className="max-w-full max-h-full"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaViewer;
