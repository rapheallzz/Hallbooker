import Link from "next/link";
import { Star } from "lucide-react";

import { Hall } from "@/types/hall";

interface HallCardProps {
  hall: Hall;
}

const HallCard = ({ hall }: HallCardProps) => {
  const displayPrice = hall.pricing?.dailyRate || hall.pricing?.hourlyRate;
  const priceUnit = hall.pricing?.dailyRate ? 'day' : 'hour';

  return (
    <Link href={`/halls/${hall._id}`} className="h-full">
      <div data-testid="hall-card" className="h-full block bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
        <img
          className="h-48 w-full object-cover"
          src={
            hall.images && hall.images.length > 0
              ? hall.images[0]
              : "/hall_default.jpg"
          }
          alt={hall.name}
        />
        <div className="p-1.5">
          <h3 className="text-[11px] font-bold text-gray-800 truncate">{hall.name}</h3>
          <p className="mt-0 text-[10px] text-gray-500 truncate">{hall.location}</p>
          <div className="mt-0.5 flex justify-between items-center">
            <p className="text-[11px] font-semibold text-gray-800">
              {displayPrice ? (
                <>
                  <span className="font-bold">₦{displayPrice.toLocaleString()}</span> / {priceUnit}
                </>
              ) : (
                <span className="text-gray-500">Price not available</span>
              )}
            </p>
            <div className="flex items-center text-[10px]">
              <Star className="h-3 w-3 text-gray-400" />
              {hall.averageRating > 0 ? (
                <>
                  <span className="ml-1 text-gray-600 font-semibold">
                    {hall.averageRating.toFixed(1)}
                  </span>
                </>
              ) : (
                <span className="ml-1 text-gray-500">New</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default HallCard;
