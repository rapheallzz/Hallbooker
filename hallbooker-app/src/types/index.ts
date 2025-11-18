export interface Facility {
  _id: string;
  available: boolean;
  chargeable: boolean;
  chargeMethod: string;
  cost: number;
  facility?: {
    _id: string;
    name: string;
  };
  name?: string;
}

export interface Hall {
  _id: string;
  name: string;
  description: string;
  images: string[];
  videos: string[];
  pricing: {
    dailyRate?: number;
    hourlyRate?: number;
  };
  location: string;
  capacity: number;
  averageRating: number;
  numReviews: number;
  facilities: Facility[];
  owner: {
    _id: string;
    fullName: string;
  };
  openingHour?: number;
  closingHour?: number;
}
