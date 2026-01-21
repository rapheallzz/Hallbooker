import { Facility, Suitability } from './index';

export interface Hall {
  id: string;
  _id: string;
  name: string;
  location: string;
  capacity: number;
  description: string;
  images: string[];
  videos?: string[];
  averageRating: number;
  numReviews: number;
  facilities: Facility[];
  blockedDates?: string[];
  owner?: {
    _id: string;
    fullName: string;
  };
  pricing: {
    dailyRate?: number;
    hourlyRate?: number;
  };
  openingHour?: number;
  closingHour?: number;
  bookingBufferInHours?: number;
  isListed?: boolean;
  geoLocation?: {
    type: string;
    coordinates: number[];
    address?: string;
  };
  suitableFor?: (Suitability | string)[];
  rules?: string[] | string;
  views?: number;
  createdAt?: string;
  distance?: number;
}
