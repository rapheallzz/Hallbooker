import {
  Wifi,
  ParkingSquare,
  Projector,
  Mic,
  Sofa,
  Utensils,
  Wind,
  Tv,
  Dumbbell,
  Dog,
  CookingPot,
  Refrigerator,
  Wine,
  Coffee,
  Heater,
  Box,
  type LucideIcon,
} from 'lucide-react';

const iconMap: { [key: string]: LucideIcon } = {
  wifi: Wifi,
  parking: ParkingSquare,
  projector: Projector,
  microphone: Mic,
  sofa: Sofa,
  utensils: Utensils,
  'air conditioning': Wind,
  tv: Tv,
  gym: Dumbbell,
  'pet friendly': Dog,
  kitchen: CookingPot,
  refrigerator: Refrigerator,
  bar: Wine,
  coffee: Coffee,
  heating: Heater,
};

const FacilityIcon = ({ name }: { name: string | undefined }) => {
  if (!name) {
    return <Box className="h-6 w-6 text-gray-600" />;
  }

  const normalizedName = name.toLowerCase();
  const iconKey = Object.keys(iconMap).find((key) =>
    normalizedName.includes(key)
  );

  const IconComponent = iconKey ? iconMap[iconKey] : Box;

  return <IconComponent className="h-6 w-6 text-gray-600" />;
};

export default FacilityIcon;
