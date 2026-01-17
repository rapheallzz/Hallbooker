"use client";
import React, { useState } from 'react';
import { Star, X } from 'lucide-react';
import api from '@/services/api';
import Swal from 'sweetalert2';
import { Booking, Review } from '@/types';

interface ReviewModalProps {
  booking: Booking;
  existingReview: Review | null;
  onClose: () => void;
  onReviewSubmitted: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ booking, existingReview, onClose, onReviewSubmitted }) => {
  const [rating, setRating] = useState(existingReview ? existingReview.rating : 0);
  const [comment, setComment] = useState(existingReview ? existingReview.comment : '');
  const [loading, setLoading] = useState(false);
  const [hover, setHover] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      Swal.fire('Error', 'Please provide a rating.', 'error');
      return;
    }
    if (!comment.trim()) {
      Swal.fire('Error', 'Please provide a comment.', 'error');
      return;
    }

    setLoading(true);
    try {
      await api.post(`/reviews/hall/${booking.hall._id}/booking/${booking._id}`, {
        rating,
        comment,
      });
      Swal.fire('Success', 'Your review has been submitted.', 'success');
      onReviewSubmitted();
      onClose();
    } catch (error: unknown) {
      console.error('Error submitting review:', error);
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to submit review.';
      Swal.fire('Error', errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-lg shadow-xl overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            {existingReview ? 'Your Review' : `Rate & Review ${booking.hall?.name || 'Hall'}`}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {existingReview ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, index) => {
                  const ratingValue = index + 1;
                  return (
                    <Star
                      key={index}
                      size={24}
                      className={ratingValue <= existingReview.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                    />
                  );
                })}
              </div>
              <p className="text-gray-700 italic">&quot;{existingReview.comment}&quot;</p>
              <div className="text-sm text-gray-500">
                Submitted on {new Date(existingReview.createdAt).toLocaleDateString()}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, index) => {
                    const ratingValue = index + 1;
                    return (
                      <button
                        type="button"
                        key={index}
                        className="focus:outline-none"
                        onClick={() => setRating(ratingValue)}
                        onMouseEnter={() => setHover(ratingValue)}
                        onMouseLeave={() => setHover(0)}
                      >
                        <Star
                          size={32}
                          className={`${
                            ratingValue <= (hover || rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                          } transition-colors duration-200`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Experience
                </label>
                <textarea
                  id="comment"
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-primary focus:border-primary text-gray-800"
                  placeholder="Tell others about your experience with this hall..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  disabled={loading}
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-6 py-2 bg-primary text-white rounded-md font-semibold ${
                    loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-opacity-90'
                  }`}
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Post Review'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
