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
  bookingId: string;
  hall: string | Hall;
  user: string | { _id: string; fullName: string; email: string };
  bookingDates: {
    startTime: string;
    endTime: string;
  }[];
  totalPrice: number;
  paymentStatus: string;
  bookingStatus?: 'pending' | 'confirmed' | 'cancelled' | string;
  status?: 'pending' | 'confirmed' | 'cancelled' | string;
  eventDetails?: string;
  createdAt: string;
  review?: Review;
  isRecurring?: boolean;
  recurringBookingId?: string;
  paymentMethod?: string;
  bookingType?: string;
  walkInUserDetails?: {
    fullName: string;
    email: string;
    phone: string;
  };
}

export interface Reservation {
  _id: string;
  reservationId: string;
  hall: string | Hall;
  user: string | { _id: string; fullName: string; email: string };
  bookingDates: {
    startTime: string;
    endTime: string;
  }[];
  totalPrice: number;
  status: string;
  paymentStatus?: string;
  walkInUserDetails?: {
    fullName: string;
    email: string;
    phone: string;
  };
}

export interface Suitability {
  _id: string;
  name: string;
  id: string;
}

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
}

export interface Notification {
  _id: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface Review {
  _id?: string;
  hall?: string;
  booking?: string;
  user?: {
    _id: string;
    fullName: string;
  };
  rating: number;
  comment: string;
  createdAt?: string;
}

export interface UnavailableDate {
  bufferTime: {
    startTime: string;
    endTime: string;
  };
}
