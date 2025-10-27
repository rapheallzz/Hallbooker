'use client';

const CollapsedSearchBar = ({ onSearchClick }: { onSearchClick: () => void }) => {
  return (
    <div
      className="w-full max-w-md mx-auto cursor-pointer"
      onClick={onSearchClick}
    >
      <div className="flex items-center justify-between px-2 py-1 bg-white border border-gray-200 rounded-full shadow-sm">
        <div className="flex items-center divide-x divide-gray-200">
          <div className="px-4">
            <p className="text-sm font-semibold text-gray-800">Location</p>
          </div>
          <div className="px-4">
            <p className="text-sm font-semibold text-gray-800">Date</p>
          </div>
          <div className="px-4">
            <p className="text-sm font-semibold text-gray-800">Capacity</p>
          </div>
        </div>
        <div className="p-2 text-white bg-primary rounded-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default CollapsedSearchBar;
