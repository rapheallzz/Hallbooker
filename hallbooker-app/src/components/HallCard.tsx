import Link from "next/link";
import { Star } from "lucide-react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import { Hall } from "@/types/hall";

interface HallCardProps {
  hall: Hall;
}

const HallCard = ({ hall }: HallCardProps) => {
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
        <div className="hall-card-slider">
          {hall.images && hall.images.length > 1 ? (
            <Slider {...settings}>
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
          <div className="p-1.5">
            <h3 className="text-[11px] font-bold text-gray-800 truncate">{hall.name}</h3>
          <p className="mt-0 text-[10px] text-gray-500 truncate">{hall.location}</p>
          <div className="mt-0.5 flex justify-between items-center">
            <div className="text-[11px] font-semibold text-gray-800">
              {dailyRate && hourlyRate ? (
                <div className="flex space-x-2">
                  <p>
                    <span className="font-bold">₦{dailyRate.toLocaleString()}</span> / day
                  </p>
                  <p>
                    <span className="font-bold">₦{hourlyRate.toLocaleString()}</span> / hour
                  </p>
                </div>
              ) : dailyRate ? (
                <p>
                  <span className="font-bold">₦{dailyRate.toLocaleString()}</span> / day
                </p>
              ) : hourlyRate ? (
                <p>
                  <span className="font-bold">₦{hourlyRate.toLocaleString()}</span> / hour
                </p>
              ) : (
                <span className="text-gray-500">Price not available</span>
              )}
            </div>
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
        </Link>
      </div>
    </div>
  );
};

export default HallCard;
