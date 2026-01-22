"use client";
import React, { useState, useEffect } from "react";
import api from "../../services/api";
import BookingCard from "./BookingCard";
import BookingDetailsModal from "./BookingDetailsModal";
import ReviewModal from "./ReviewModal";
import Swal from "sweetalert2";
import { useAuth } from "@/context/AuthContext";
import { Booking, Review, Hall } from "@/types";

const BookingsView = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("upcoming");

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState<Booking | null>(null);
  const [existingReview, setExistingReview] = useState<Review | null>(null);

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

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      Swal.fire("Validation Error", "Please enter a booking ID to search.", "error");
      return;
    }
    try {
      const response = await api.get(`/bookings/search/${searchTerm}`);
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

  const handleReviewClick = async (booking: Booking) => {
    // Requirements: paid and completed (bookingStatus check anticipated)
    if (booking.paymentStatus !== 'paid') {
      Swal.fire('Ineligible', 'You can only review bookings that have been paid in full.', 'info');
      return;
    }

    // Future-proofing for bookingStatus
    if (booking.bookingStatus && booking.bookingStatus !== 'completed') {
      Swal.fire('Ineligible', 'You can only review bookings that are completed.', 'info');
      return;
    }

    if (booking.review) {
      setExistingReview(booking.review);
      setSelectedBookingForReview(booking);
      setIsReviewModalOpen(true);
      return;
    }

    try {
      Swal.showLoading();
      // Fetch all reviews for this hall to check if one exists for this booking (fallback)
      const hallId = typeof booking.hall === 'object' ? (booking.hall as Hall)._id : booking.hall;
      const response = await api.get(`/reviews/hall/${hallId}`);
      const reviews = (response.data.data || []) as Review[];

      const foundReview = reviews.find((r: Review) =>
        r.booking === booking._id && r.user?._id === user?.id
      );

      setExistingReview(foundReview || null);
      setSelectedBookingForReview(booking);
      setIsReviewModalOpen(true);
      Swal.close();
    } catch (error) {
      console.error("Error checking for existing review:", error);
      Swal.fire("Error", "Failed to check review status.", "error");
    }
  };

  const handleViewReceipt = async (bookingId: string) => {
    try {
      const response = await api.get(`/bookings/search/${bookingId}`);
      if (response.data.data) {
        setSelectedBooking(response.data.data);
        setIsModalOpen(true);
      } else {
        Swal.fire("Not Found", "Booking details could not be found.", "error");
      }
    } catch (error) {
      console.error("Error fetching booking details:", error);
      Swal.fire("Error", "Failed to fetch booking details.", "error");
    }
  };

  const filteredBookings = bookings.filter((booking: Booking) => {
    if (!booking.bookingDates || booking.bookingDates.length === 0) return activeTab === "upcoming";
    const latestEndTime = new Date(
      Math.max(...booking.bookingDates.map((d) => new Date(d.endTime).getTime()))
    );
    const now = new Date();
    const isPast = latestEndTime < now;
    return activeTab === "past" ? isPast : !isPast;
  });

  return (
    <div>
      <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-6">My Bookings</h2>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-6">
        <div className="flex border-b w-full lg:w-auto">
          <button
            className={`flex-1 lg:flex-none px-6 py-3 font-semibold transition-colors duration-200 ${
              activeTab === "upcoming"
                ? "border-b-2 border-primary text-primary"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("upcoming")}
          >
            Upcoming
          </button>
          <button
            className={`flex-1 lg:flex-none px-6 py-3 font-semibold transition-colors duration-200 ${
              activeTab === "past"
                ? "border-b-2 border-primary text-primary"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("past")}
          >
            Past
          </button>
        </div>
        <div className="flex items-center w-full lg:max-w-md">
          <input
            type="text"
            placeholder="Search by booking ID..."
            className="flex-grow p-3 border border-gray-300 rounded-l-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            className="px-6 py-3 bg-primary text-white font-semibold rounded-r-lg hover:bg-opacity-90 transition-all shadow-sm"
            onClick={handleSearch}
          >
            Search
          </button>
        </div>
      </div>
      {filteredBookings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBookings.map((booking: Booking) => (
            <BookingCard
              key={booking._id}
              booking={booking}
              onViewReceipt={handleViewReceipt}
              onReview={handleReviewClick}
              isPast={activeTab === "past"}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-white rounded-lg shadow">
          <p className="text-gray-500 text-lg">No {activeTab} bookings found.</p>
        </div>
      )}
      {isModalOpen && (
        <BookingDetailsModal
          booking={selectedBooking}
          onClose={handleCloseModal}
        />
      )}
      {isReviewModalOpen && selectedBookingForReview && (
        <ReviewModal
          booking={selectedBookingForReview}
          existingReview={existingReview}
          onClose={() => setIsReviewModalOpen(false)}
          onReviewSubmitted={() => {
            // No need to do much as existingReview logic handles it,
            // but we could refresh bookings if needed.
          }}
        />
      )}
    </div>
  );
};

export default BookingsView;
