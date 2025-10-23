import Link from "next/link";

interface HallCardProps {
  hall: {
    id: string;
    name: string;
    description: string;
    media: { url: string }[];
    price: number;
    location: string;
  };
}

const HallCard = ({ hall }: HallCardProps) => {
  return (
    <Link href={`/venues/${hall.id}`}>
      <div className="block bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
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
          <h3 className="text-lg font-semibold text-gray-900">{hall.name}</h3>
          <p className="mt-1 text-sm text-gray-500">{hall.location}</p>
          <p className="mt-2 text-gray-600 truncate">{hall.description}</p>
          <p className="mt-4 text-xl font-bold text-primary">
            ${hall.price} / day
          </p>
        </div>
      </div>
    </Link>
  );
};

export default HallCard;
