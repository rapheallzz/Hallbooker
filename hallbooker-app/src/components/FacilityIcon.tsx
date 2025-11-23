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
  Armchair, // Added for Chairs
  Square,   // Added for Tables
  PartyPopper, // Added for Event Planning/Decoration
  type LucideIcon,
} from 'lucide-react';

const iconMap: { [key: string]: LucideIcon } = {
  wifi: Wifi,
  internet: Wifi,
  parking: ParkingSquare,
  projector: Projector,
  led: Projector,
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
  chairs: Armchair,
  tables: Square,
  'event planning': PartyPopper,
  decoration: PartyPopper,
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
