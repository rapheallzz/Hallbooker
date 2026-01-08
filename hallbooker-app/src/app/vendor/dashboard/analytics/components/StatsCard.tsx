import React from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value }) => {
  return (
    <div className="bg-white p-4 shadow-lg rounded-lg">
      <h2 className="text-sm font-semibold text-gray-500 mb-2">{title}</h2>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
    </div>
  );
};

export default StatsCard;
