"use client";
import React, { useState, useEffect } from "react";
import api from "@/services/api";

interface Hall {
  id: string;
  name: string;
  location: string;
  capacity: number;
  isOnline: boolean;
}

const HallsPage = () => {
  const [halls, setHalls] = useState<Hall[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHalls = async () => {
      try {
        const response = await api.get("/halls/by-owner");
        setHalls(response.data.data);
      } catch (error) {
        console.error("Error fetching halls:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHalls();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-primary">Halls</h1>
        <button
          onClick={() => console.log("Create Hall clicked")}
          className="bg-primary text-white px-4 py-2 rounded-lg"
        >
          Create Hall
        </button>
      </div>
      <div className="bg-white p-4 shadow-lg rounded-lg">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-primary tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-primary tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-primary tracking-wider">
                Capacity
              </th>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-primary tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 border-b-2 border-gray-300"></th>
            </tr>
          </thead>
          <tbody>
            {halls.map((hall) => (
              <tr key={hall.id}>
                <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">
                  {hall.name}
                </td>
                <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">
                  {hall.location}
                </td>
                <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">
                  {hall.capacity}
                </td>
                <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      hall.isOnline
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {hall.isOnline ? "Online" : "Offline"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-no-wrap text-right border-b border-gray-500">
                  <button
                    onClick={() => console.log(`Edit hall ${hall.id}`)}
                    className="px-5 py-2 border-primary border text-primary rounded transition duration-300 hover:bg-primary hover:text-white focus:outline-none"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => console.log(`Delete hall ${hall.id}`)}
                    className="ml-2 px-5 py-2 border-red-500 border text-red-500 rounded transition duration-300 hover:bg-red-500 hover:text-white focus:outline-none"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HallsPage;
