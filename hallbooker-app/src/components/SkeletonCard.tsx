const SkeletonCard = () => {
  return (
    <div className="block bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="h-56 bg-gray-200 animate-pulse"></div>
      <div className="p-4">
        <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4"></div>
        <div className="mt-2 h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
        <div className="mt-4 h-4 bg-gray-200 rounded animate-pulse w-1/4"></div>
      </div>
    </div>
  );
};

export default SkeletonCard;
