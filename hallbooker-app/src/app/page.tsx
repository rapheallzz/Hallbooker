'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Carousel from '@/components/Carousel';
import SkeletonCard from '@/components/SkeletonCard';
import SearchBar from '@/components/SearchBar';
import api from '@/services/api';
import useScroll from '@/hooks/useScroll';
import { Hall } from '@/types/hall';

const HomePage = () => {
  const router = useRouter();
  const [allHalls, setAllHalls] = useState<Hall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const scrolled = useScroll(100);

  useEffect(() => {
    const fetchHalls = async () => {
      try {
        const response = await api.get('/halls');
        const hallsData = response.data.data;

        if (Array.isArray(hallsData)) {
          setAllHalls(hallsData);
        } else {
          throw new Error('Invalid data format');
        }
      } catch (err) {
        console.error('Failed to fetch halls:', err);
        setError('Failed to fetch halls. See console for details.');
      } finally {
        setLoading(false);
      }
    };

    fetchHalls();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting geolocation:', error);
        }
      );
    }
  }, []);

  const handleSearch = (filters: { location: string; dateRange: any; capacity: string; priceRange: [number, number] }) => {
    const { location, capacity, priceRange, dateRange } = filters;
    const [minPrice, maxPrice] = priceRange;

    const params = new URLSearchParams();
    if (location) params.set('keyword', location);
    if (capacity && capacity !== 'Any') {
      const match = capacity.match(/(\d+)/);
      if (match) params.set('minCapacity', match[0]);
    }
    params.set('minPrice', minPrice.toString());
    params.set('maxPrice', maxPrice.toString());

    if (dateRange?.from) {
      params.set('startDate', dateRange.from.toISOString().split('T')[0]);
    }
    if (dateRange?.to) {
      params.set('endDate', dateRange.to.toISOString().split('T')[0]);
    }

    router.push(`/search?${params.toString()}`);
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  const popularHalls = useMemo(() => {
    return [...allHalls].sort((a, b) => (b.views || 0) - (a.views || 0));
  }, [allHalls]);

  const closestHalls = useMemo(() => {
    if (!userLocation) return [];
    return allHalls
      .filter((hall) => hall.geoLocation?.coordinates && hall.geoLocation.coordinates.length === 2)
      .map((hall) => ({
        ...hall,
        distance: calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          hall.geoLocation!.coordinates[1],
          hall.geoLocation!.coordinates[0]
        ),
      }))
      .sort((a, b) => (a.distance || 0) - (b.distance || 0));
  }, [allHalls, userLocation]);

  const largeCapacityHalls = useMemo(() => {
    return allHalls.filter((hall) => hall.capacity >= 500);
  }, [allHalls]);

  const budgetFriendlyHalls = useMemo(() => {
    return allHalls.filter(
      (hall) => (hall.pricing?.dailyRate || 0) <= 200000 && (hall.pricing?.dailyRate || 0) > 0
    );
  }, [allHalls]);

  const newlyAddedHalls = useMemo(() => {
    return [...allHalls].sort((a, b) => {
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });
  }, [allHalls]);

  const highlyRatedHalls = useMemo(() => {
    return allHalls.filter((hall) => hall.averageRating >= 4);
  }, [allHalls]);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 pt-24 pb-8 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Find the perfect hall for your next event
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Browse through our curated list of halls and book with ease.
          </p>
          <div className="mt-8">
            {!scrolled && <SearchBar onSearch={handleSearch} />}
          </div>
        </div>

        {loading && (
          <div>
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Popular Halls
              </h2>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            </section>
          </div>
        )}

        {error && <p className="mt-8 text-center text-red-600">{error}</p>}

        {!loading && !error && (
          <div className="space-y-12">
            {popularHalls.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Halls</h2>
                <Carousel halls={popularHalls} />
              </section>
            )}

            {closestHalls.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Closest to You</h2>
                <Carousel halls={closestHalls} />
              </section>
            )}

            {highlyRatedHalls.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Highly Rated</h2>
                <Carousel halls={highlyRatedHalls} />
              </section>
            )}

            {newlyAddedHalls.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Newly Added</h2>
                <Carousel halls={newlyAddedHalls} />
              </section>
            )}

            {largeCapacityHalls.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Large Capacity Halls</h2>
                <Carousel halls={largeCapacityHalls} />
              </section>
            )}

            {budgetFriendlyHalls.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Budget Friendly</h2>
                <Carousel halls={budgetFriendlyHalls} />
              </section>
            )}

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Locations</h2>
              <Carousel halls={allHalls.slice(0, 7)} />
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;
