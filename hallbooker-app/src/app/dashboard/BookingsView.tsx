"use client";
import React, { useState, useEffect } from "react";
import api from "../../services/api";
import BookingCard from "./BookingCard";

const BookingsView = () => {
  const [bookings, setBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await api.get("/bookings/my-bookings");
        setBookings(response.data.data || []);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    };
    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter((booking) =>
    booking.bookingId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">My Bookings</h2>
      <div className="flex justify-end mb-6">
        <input
          type="text"
          placeholder="Search by booking ID..."
          className="p-2 border border-gray-400 rounded-md w-1/2 md:w-1/3 text-gray-800"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBookings.map((booking) => (
          <BookingCard key={booking._id} booking={booking} />
        ))}
      </div>
    </div>
  );
};

export default BookingsView;
