import api from './api';
import { AxiosResponse } from 'axios';

// Define the expected response structure based on the provided JSON
export interface OverallStats {
  totalRevenue: number;
  totalViews: number;
  totalDemoBookings: number;
  totalBookings: {
    confirmed: number;
    cancelled: number;
    pending: number;
  };
}

export interface RevenueDetails {
  breakdownByHall: {
    totalRevenue: number;
    hallRevenue: number;
    facilityRevenue: number;
    hallId: string;
    hallName: string;
  }[];
}

export interface Booking {
  _id: string;
  user: {
    _id: string;
    fullName: string;
    email: string;
  } | null;
  hall: {
    _id: string;
    name: string;
    id: string;
  };
  eventDetails: string;
  bookingDates: {
    startTime: string;
    endTime: string;
    _id: string;
  }[];
  totalPrice: number;
  hallPrice: number;
  facilitiesPrice: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  reviewNotificationSent: boolean;
  bookingId: string;
  bookedBy: string;
  bookingType: string;
  isRecurring: boolean;
  selectedFacilities: {
    facility: string;
    name: string;
    cost: number;
    chargeMethod: string;
    quantity: number;
    _id: string;
  }[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  walkInUserDetails?: {
    fullName: string;
    email: string;
    phone: string;
  };
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalBookings: number;
}

export interface RecentBookings {
  bookings: Booking[];
  pagination: Pagination;
}

export interface Kpis {
  bookingConversionRate: string;
  averageBookingValue: string;
  busiestDays: {
    day: string;
    count: number;
  }[];
}

export interface AnalyticsData {
  overallStats: OverallStats;
  revenueDetails: RevenueDetails;
  recentBookings: RecentBookings;
  kpis: Kpis;
}

interface AnalyticsApiResponse {
  statusCode: number;
  data: AnalyticsData;
  message: string;
  success: boolean;
}

// Define the query parameters
interface AnalyticsParams {
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export const getHallOwnerAnalytics = async (params: AnalyticsParams): Promise<AnalyticsApiResponse> => {
  try {
    const response: AxiosResponse<AnalyticsApiResponse> = await api.get('/analytics/hall-owner', {
      baseURL: 'https://hallbooker.onrender.com/api/v2', // Overriding the base URL for v2
      params,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
