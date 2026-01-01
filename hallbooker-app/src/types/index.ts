export interface Facility {
  _id: string;
  available: boolean;
  chargeable: boolean;
  chargeMethod: 'free' | 'flat' | 'per_day' | 'per_hour';
  cost: number;
  quantity: number;
  chargePerUnit: boolean;
  facility?: {
    _id: string;
    name: string;
  };
  name?: string;
}

export interface Booking {
  _id: string;
  bookingDates: {
    startTime: string;
    endTime: string;
  }[];
}

export interface Hall {
  id: string; // id is used in some places, _id in others
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
  geoLocation?: {
    type: string;
    coordinates: number[];
    address?: string;
  };
}
