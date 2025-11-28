'use client';

import { useState, useEffect } from 'react';
import api from '@/services/api';
import Image from 'next/image';

interface Hall {
  _id: string;
  name: string;
  images: string[];
}

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  const [halls, setHalls] = useState<Hall[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchHalls = async () => {
      try {
        const response = await api.get('/halls');
        const hallsWithImages = response.data.data.filter((hall: Hall) => hall.images && hall.images.length > 0);
        setHalls(hallsWithImages);
      } catch (error) {
        console.error('Failed to fetch halls:', error);
      }
    };

    fetchHalls();
  }, []);

  useEffect(() => {
    if (halls.length > 0) {
      const timer = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % halls.length);
      }, 5000); // Change image every 5 seconds

      return () => clearInterval(timer);
    }
  }, [halls]);

  const currentHall = halls[currentImageIndex];
  const backgroundImage = currentHall?.images[0] || '/hall_default.jpg';

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 bg-cover bg-center lg:block">
        <Image
          src={backgroundImage}
          alt={currentHall?.name || 'Hall'}
          layout="fill"
          objectFit="cover"
          quality={100}
          className="transition-opacity duration-1000"
        />
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white">
          <h1 className="text-4xl font-bold">HallBooker</h1>
          <p className="mt-4 text-lg text-center">Find and book the perfect hall for your event.</p>
        </div>
      </div>
      <div className="flex items-center justify-center w-full p-8 bg-white lg:w-1/2">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
