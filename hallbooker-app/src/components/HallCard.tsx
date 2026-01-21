'use client';
import Link from "next/link";
import { Star, Eye } from "lucide-react";
import Slider from "react-slick";

import { Hall } from "@/types/hall";
import { useAuth } from "@/context/AuthContext";
import { VIEW_COUNT_ROLES } from '@/constants/auth';

interface HallCardProps {
  hall: Hall;
}

const HallCard = ({ hall }: HallCardProps) => {
  const { user } = useAuth();
  const canSeeViews = user && VIEW_COUNT_ROLES.includes(user.activeRole);
  const { dailyRate, hourlyRate } = hall.pricing || {};

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  return (
    <div className="h-full">
      <div data-testid="hall-card" className="h-full block bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
        <div className="relative hall-card-slider">
          {hall.images && hall.images.length > 1 ? (
            <Slider {...settings} className="hall-card-slick">
              {hall.images.map((image, index) => (
                <Link href={`/halls/${hall._id}`} key={index}>
                  <img
                    className="h-48 w-full object-cover"
                    src={image}
                    alt={`${hall.name} image ${index + 1}`}
                  />
                </Link>
              ))}
            </Slider>
          ) : (
            <Link href={`/halls/${hall._id}`}>
              <img
                className="h-48 w-full object-cover"
                src={hall.images && hall.images.length > 0 ? hall.images[0] : "/hall_default.jpg"}
                alt={hall.name}
              />
            </Link>
          )}
        </div>
        <Link href={`/halls/${hall._id}`} className="h-full">
          <div className="p-3">
            <h3 className="text-sm font-bold text-gray-800 truncate">{hall.name}</h3>
          <p className="mt-0.5 text-xs text-gray-500 truncate">{hall.location}</p>
          <div className="mt-2 flex justify-between items-end">
            <div className="text-xs font-semibold text-gray-800 min-h-[2.5em] flex items-center">
              {dailyRate && hourlyRate ? (
                <div>
                  <p>
                    <span className="font-bold text-sm">₦{dailyRate.toLocaleString()}</span>/day
                  </p>
                  <p>
                    <span className="font-bold">₦{hourlyRate.toLocaleString()}</span>/hr
                  </p>
                </div>
              ) : dailyRate ? (
                <p>
                  <span className="font-bold text-sm">₦{dailyRate.toLocaleString()}</span> / day
                </p>
              ) : hourlyRate ? (
                <p>
                  <span className="font-bold text-sm">₦{hourlyRate.toLocaleString()}</span> / hour
                </p>
              ) : (
                <span className="text-gray-500">Price not available</span>
              )}
            </div>
            <div className="flex flex-col items-end text-[11px] space-y-1 pb-0.5">
              <div className="flex items-center">
                <Star className="h-3.5 w-3.5 text-gray-400 fill-gray-400" />
                {hall.averageRating > 0 ? (
                  <span className="ml-1 text-gray-400 font-semibold">
                    {hall.averageRating.toFixed(1)}
                  </span>
                ) : (
                  <span className="ml-1 text-gray-400">New</span>
                )}
              </div>
              {canSeeViews && (
                <div className="flex items-center text-gray-500">
                  <Eye className="h-3 w-3 mr-1" />
                  <span>{hall.views || 0}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        </Link>
      </div>
    </div>
  );
};

export default HallCard;
