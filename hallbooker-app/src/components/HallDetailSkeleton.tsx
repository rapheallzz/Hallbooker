const HallDetailSkeleton = () => {
  return (
    <div className="bg-white min-h-screen animate-pulse">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-28">
        {/* Title and Info Skeleton */}
        <div className="mb-4">
          <div className="h-9 bg-gray-200 rounded w-3/4 mb-3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>

        {/* Image Gallery Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 md:grid-rows-2 gap-2 h-96 rounded-xl overflow-hidden">
          <div className="md:col-span-1 md:row-span-2 h-full bg-gray-200 rounded-lg"></div>
          <div className="hidden md:grid grid-cols-2 grid-rows-1 gap-2 h-full">
            <div className="bg-gray-200 rounded-lg"></div>
            <div className="bg-gray-200 rounded-lg"></div>
          </div>
          <div className="hidden md:grid grid-cols-2 grid-rows-1 gap-2 h-full">
            <div className="bg-gray-200 rounded-lg"></div>
            <div className="bg-gray-200 rounded-lg"></div>
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-12 mt-8">
          <div className="lg:col-span-2">
            {/* Capacity Skeleton */}
            <div className="pb-6 border-b">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/6"></div>
            </div>

            {/* About Skeleton */}
            <div className="py-6 border-b">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>

            {/* Offers Skeleton */}
            <div className="py-6">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>

          {/* Sticky Booking Widget Skeleton */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 border rounded-xl shadow-lg p-6">
              <div className="flex items-baseline mb-4">
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </div>
              <div className="mt-4">
                <div className="h-12 bg-gray-300 rounded-lg w-full"></div>
              </div>
              <div className="mt-2">
                <div className="h-12 bg-gray-300 rounded-lg w-full"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mt-4"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HallDetailSkeleton;
