import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface RevenueChartProps {
  data: {
    hallName: string;
    totalRevenue: number;
    hallRevenue: number;
    facilityRevenue: number;
  }[];
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  return (
    <div className="bg-white p-4 shadow-lg rounded-lg">
      <h2 className="text-xl font-bold mb-2 text-gray-600">Revenue Breakdown by Hall</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="hallName" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="hallRevenue" stackId="a" fill="#8884d8" name="Hall Revenue" />
          <Bar dataKey="facilityRevenue" stackId="a" fill="#82ca9d" name="Facility Revenue" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;
