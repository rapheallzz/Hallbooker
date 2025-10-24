'use client';

import { useState } from 'react';

const CollapsedSearchBar = ({ onSearchClick }: { onSearchClick: () => void }) => {
  return (
    <div
      className="w-full max-w-lg mx-auto cursor-pointer"
      onClick={onSearchClick}
    >
      <div className="flex items-center justify-between px-4 py-2 bg-white border border-gray-200 rounded-full shadow-md">
        <span className="font-semibold text-gray-800">Start your search</span>
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
