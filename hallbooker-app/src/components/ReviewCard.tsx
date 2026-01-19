// components/ReviewCard.tsx
import React from 'react';
import { Star } from 'lucide-react';

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
        <div className="flex items-center space-x-0.5">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < rating ? 'text-gray-400 fill-gray-400' : 'text-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
      <p className="text-gray-700">{comment}</p>
    </div>
  );
};

export default ReviewCard;
