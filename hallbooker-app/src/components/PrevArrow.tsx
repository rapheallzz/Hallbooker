import { ChevronLeft } from 'lucide-react';

interface PrevArrowProps {
  onClick?: () => void;
}

const PrevArrow = ({ onClick }: PrevArrowProps) => {
  return (
    <div
      className="custom-arrow prev-arrow"
      onClick={onClick}
    >
      <ChevronLeft size={24} />
    </div>
  );
};

export default PrevArrow;
