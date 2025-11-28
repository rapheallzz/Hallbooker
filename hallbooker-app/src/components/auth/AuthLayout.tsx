"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import Image from 'next/image';

const Logo = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-12 h-12 text-white"
  >
    <path d="M4 4h16v2H4V4zm0 14h16v2H4v-2zm0-7h16v2H4v-2z" />
  </svg>
);

interface Hall {
  images: string[];
}

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  const [bgImage, setBgImage] = useState('/hall_default.jpg');

  useEffect(() => {
    const fetchHallImages = async () => {
      try {
        const response = await axios.get('https://hallbooker.onrender.com/api/v1/halls');
        const halls = response.data.data;
        if (halls && halls.length > 0) {
          const allImages = halls.flatMap((hall: Hall) => hall.images);
          if (allImages.length > 0) {
            const randomImage = allImages[Math.floor(Math.random() * allImages.length)];
            const secureImageUrl = randomImage.replace(/^http:/, 'https:');
            setBgImage(secureImageUrl);
          }
        }
      } catch (error) {
        console.error('Failed to fetch hall images:', error);
      }
    };

    fetchHallImages();
  }, []);

  return (
    <div className="flex h-screen">
      <div className="relative w-1/2 h-full">
        {bgImage && (
          <Image
            src={bgImage}
            alt="Hall"
            fill
            style={{ objectFit: 'cover' }}
            className="opacity-50"
          />
        )}
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white">
          <Logo />
          <h1 className="text-4xl font-bold mt-4">Hall Booker</h1>
          <p className="text-lg mt-2">Discover the perfect hall for your next event.</p>
        </div>
      </div>
      <div className="w-1/2 h-full flex items-center justify-center bg-white">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
