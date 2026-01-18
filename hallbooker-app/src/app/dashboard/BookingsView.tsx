"use client";
import React, { useState, useEffect } from "react";
import api from "../../services/api";
import BookingCard from "./BookingCard";
import BookingDetailsModal from "./BookingDetailsModal";
import ReviewModal from "./ReviewModal";
import Swal from "sweetalert2";
import { useAuth } from "@/context/AuthContext";
import { Booking, Review } from "@/types";

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
      const response = await api.get(`/reviews/hall/${booking.hall._id}`);
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

  const filteredBookings = bookings.filter((booking: { bookingDates: { endTime: string }[] }) => {
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
      <h2 className="text-2xl font-bold text-gray-800 mb-4">My Bookings</h2>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="flex border-b">
          <button
            className={`px-4 py-2 font-medium transition-colors duration-200 ${
              activeTab === "upcoming"
                ? "border-b-2 border-primary text-primary"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("upcoming")}
          >
            Upcoming
          </button>
          <button
            className={`px-4 py-2 font-medium transition-colors duration-200 ${
              activeTab === "past"
                ? "border-b-2 border-primary text-primary"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("past")}
          >
            Past
          </button>
        </div>
        <div className="flex flex-1 justify-end">
          <input
          type="text"
          placeholder="Search by booking ID..."
          className="p-2 border border-gray-400 rounded-md w-1/2 md:w-1/3 text-gray-800"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button
          className="ml-2 px-4 py-2 bg-primary text-white rounded-md"
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
      {isReviewModalOpen && (
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
