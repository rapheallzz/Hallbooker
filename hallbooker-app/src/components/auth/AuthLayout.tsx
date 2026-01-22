"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import Image from 'next/image';

const Logo = ({ className = "text-white w-12 h-12" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M4 4h16v2H4V4zm0 14h16v2H4v-2zm0-7h16v2H4v-2z" />
  </svg>
);

interface Hall {
  images: string[];
}

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  const [images, setImages] = useState<string[]>(['/hall_default.jpg']);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchHallImages = async () => {
      try {
        const response = await axios.get('https://hallbooker.onrender.com/api/v1/halls');
        const halls = response.data.data;
        if (halls && halls.length > 0) {
          const allImages = halls
            .flatMap((hall: Hall) => hall.images)
            .filter((image: string) => image); // Filter out any empty strings
          if (allImages.length > 0) {
            const secureImages = allImages.map((img: string) => img.replace(/^http:/, 'https:'));
            setImages(secureImages);
          }
        }
      } catch (error) {
        console.error('Failed to fetch hall images:', error);
      }
    };

    fetchHallImages();
  }, []);

  useEffect(() => {
    if (images.length > 1) {
      const timer = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, 5000); // Change image every 5 seconds

      return () => clearInterval(timer); // Cleanup on component unmount
    }
  }, [images.length]);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Image Section - Hidden on mobile */}
      <div className="hidden lg:block relative lg:w-1/2 lg:h-screen lg:sticky lg:top-0">
        {images.map((image, index) => (
          <Image
            key={image}
            src={image}
            alt="Hall"
            fill
            style={{ objectFit: 'cover' }}
            className={`transition-opacity duration-1000 ease-in-out ${
              index === currentIndex ? 'opacity-50' : 'opacity-0'
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white">
          <Logo />
          <h1 className="text-4xl font-bold mt-4">Hall Booker</h1>
          <p className="text-lg mt-2">Discover the perfect hall for your next event.</p>
        </div>
      </div>

      {/* Form Section */}
      <div className="w-full lg:w-1/2 min-h-screen flex flex-col items-center justify-center bg-white p-6 lg:p-0">
        {/* Mobile Logo */}
        <div className="lg:hidden mb-8">
          <Logo className="text-primary w-16 h-16" />
        </div>
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
