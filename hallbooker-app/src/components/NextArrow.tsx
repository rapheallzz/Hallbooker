import { ChevronRight } from 'lucide-react';

interface NextArrowProps {
  onClick?: () => void;
}

const NextArrow = ({ onClick }: NextArrowProps) => {
  return (
    <div
      className="custom-arrow next-arrow"
      onClick={onClick}
    >
      <ChevronRight size={24} />
    </div>
  );
};

export default NextArrow;
