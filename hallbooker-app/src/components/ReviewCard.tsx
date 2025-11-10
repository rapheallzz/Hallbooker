// components/ReviewCard.tsx
import React from 'react';

interface ReviewCardProps {
  name: string;
  date: string;
  rating: number;
  comment: string;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ name, date, rating, comment }) => {
  return (
    <div className="border rounded-lg p-4 mb-4">
      <div className="flex items-center mb-2">
        <div className="font-bold">{name}</div>
        <div className="text-gray-500 ml-2">{date}</div>
      </div>
      <div className="flex items-center mb-2">
        <div className="text-yellow-500">
          {'★'.repeat(rating)}
          {'☆'.repeat(5 - rating)}
        </div>
      </div>
      <p className="text-gray-700">{comment}</p>
    </div>
  );
};

export default ReviewCard;
