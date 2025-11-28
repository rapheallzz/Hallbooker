'use client';

import { useState, useEffect } from 'react';
import api from '@/services/api';

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
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % halls.length);
      }, 5000); // Change image every 5 seconds
      return () => clearInterval(interval);
    }
  }, [halls]);

  const currentHall = halls[currentImageIndex];
  const backgroundImage = currentHall ? currentHall.images[0] : '/hall_default.jpg';

  return (
    <div className="flex min-h-screen">
      <div
        className="hidden lg:block w-1/2 bg-cover bg-center relative"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative flex items-center justify-center h-full">
          <span className="text-white text-5xl font-bold">Hall Booker</span>
        </div>
      </div>
      <div className="w-full lg:w/2 flex items-center justify-center p-8 bg-white">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
