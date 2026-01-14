
export interface Hall {
  _id: string;
  name: string;
  description: string;
  images: string[];
  location: string;
  capacity: number;
  averageRating: number;
  numReviews: number;
  pricing?: {
    dailyRate?: number;
    hourlyRate?: number;
  };
  facilities: string[];
  owner: {
    _id: string;
    fullName: string;
  };
  geoLocation?: {
    type: string;
    coordinates: number[];
    address: string;
  };
  openingHour?: number;
  closingHour?: number;
  bookingBufferInHours?: number;
}

export interface UnavailableDate {
  reason: string;
  eventTime: {
    startTime: string;
    endTime: string;
  };
  bufferTime: {
    startTime: string;
    endTime: string;
  };
}
