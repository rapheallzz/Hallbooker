"use client";
import React, { useState, useEffect } from "react";
import { DateRange } from "react-day-picker";
import { getHallOwnerAnalytics, AnalyticsData } from "@/services/analytics";
import StatsCard from "./components/StatsCard";
import RevenueChart from "./components/RevenueChart";
import BookingsTable from "./components/BookingsTable";
import { subDays } from "date-fns";
import Calendar from "@/components/Calendar";

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!date?.from || !date?.to) return;

      setLoading(true);
      try {
        const params = {
          startDate: date.from.toISOString().split("T")[0],
          endDate: date.to.toISOString().split("T")[0],
          page: currentPage,
        };
        const response = await getHallOwnerAnalytics(params);
        setAnalytics(response.data);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [date, currentPage]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-primary">Analytics</h1>
        <div className="w-72">
          <Calendar
            mode="range"
            selected={date}
            onSelect={(newDate) => {
              setDate(newDate);
              setCurrentPage(1); // Reset to first page on new date range
            }}
            className="w-full"
          />
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : !analytics ? (
        <div>No data available</div>
      ) : (
        <>
          {/* Overall Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <StatsCard title="Total Revenue" value={`₦${analytics.overallStats.totalRevenue.toLocaleString()}`} />
            <StatsCard title="Total Bookings" value={analytics.overallStats.totalBookings.confirmed} />
            <StatsCard title="Total Views" value={analytics.overallStats.totalViews} />
            <StatsCard title="Demo Bookings" value={analytics.overallStats.totalDemoBookings} />
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <StatsCard title="Booking Conversion Rate" value={`${analytics.kpis.bookingConversionRate}`} />
            <StatsCard title="Average Booking Value" value={`₦${parseFloat(analytics.kpis.averageBookingValue).toLocaleString()}`} />
            <StatsCard title="Busiest Day" value={analytics.kpis.busiestDays.length > 0 ? analytics.kpis.busiestDays[0].day : 'N/A'} />
          </div>

          {/* Revenue Breakdown */}
          <div className="mb-8">
            <RevenueChart data={analytics.revenueDetails.breakdownByHall} />
          </div>

          {/* Recent Bookings */}
          <div>
            <BookingsTable
              bookings={analytics.recentBookings.bookings}
              pagination={analytics.recentBookings.pagination}
              onPageChange={setCurrentPage}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsPage;
