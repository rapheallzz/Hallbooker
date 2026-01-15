"use client";
import React, { useState, useEffect } from "react";
import api from "../../services/api";
import BookingCard from "./BookingCard";
import BookingDetailsModal from "./BookingDetailsModal";
import Swal from "sweetalert2";

const BookingsView = () => {
  const [bookings, setBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const [searchInput, setSearchInput] = useState("");

  const handleSearch = async () => {
    if (!searchInput.trim()) {
      Swal.fire("Validation Error", "Please enter a booking ID.", "error");
      return;
    }
    try {
      const response = await api.get(`/bookings/search/${searchInput}`);
      if (response.data.data) {
        setSelectedBooking(response.data.data);
        setIsModalOpen(true);
      } else {
        Swal.fire("Not Found", "Booking not found.", "error");
      }
    } catch (error) {
      console.error("Error searching for booking:", error);
      Swal.fire("Error", "Failed to search for booking.", "error");
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
  };

  const filteredBookings = bookings.filter((booking) =>
    booking.bookingId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">My Bookings</h2>
      <div className="flex justify-end mb-6">
        <input
          type="text"
          placeholder="Filter by booking ID..."
          className="p-2 border border-gray-400 rounded-md w-1/2 md:w-1/3 text-gray-800"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <input
          type="text"
          placeholder="Search by booking ID..."
          className="p-2 border border-gray-400 rounded-md w-1/2 md:w-1/3 text-gray-800 ml-2"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <button
          className="ml-2 px-4 py-2 bg-primary text-white rounded-md"
          onClick={handleSearch}
        >
          Search
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBookings.map((booking) => (
          <BookingCard key={booking._id} booking={booking} />
        ))}
      </div>
      {isModalOpen && (
        <BookingDetailsModal
          booking={selectedBooking}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default BookingsView;
