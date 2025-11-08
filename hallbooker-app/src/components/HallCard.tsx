import Link from "next/link";
import { Star } from "lucide-react";

interface HallCardProps {
  hall: {
    id: string;
    name: string;
    description: string;
    media: { url: string }[];
    price: number;
    location: string;
    averageRating: number;
    numReviews: number;
  };
}

const HallCard = ({ hall }: HallCardProps) => {
  return (
    <Link href={`/venues/${hall.id}`} className="h-full">
      <div data-testid="hall-card" className="h-full block bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
        <img
          className="h-56 w-full object-cover"
          src={
            hall.media && hall.media.length > 0
              ? hall.media[0].url
              : "https://via.placeholder.com/400x250"
          }
          alt={hall.name}
        />
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 truncate">{hall.name}</h3>
          <p className="mt-1 text-sm text-gray-500 truncate">{hall.location}</p>
          <p className="mt-2 text-gray-600 truncate">{hall.description}</p>
          <div className="mt-4 flex justify-between items-center">
            <p className="text-xl font-bold text-gray-800">
              <span className="font-semibold">${hall.price}</span> / day
            </p>
            {hall.averageRating > 0 && (
              <div className="flex items-center">
                <Star className="h-5 w-5 text-yellow-500" />
                <span className="ml-1 text-gray-600 font-semibold">
                  {hall.averageRating.toFixed(1)}
                </span>
                <span className="ml-2 text-gray-500 text-sm">
                  ({hall.numReviews} reviews)
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default HallCard;
