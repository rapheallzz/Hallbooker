"use client";
import React, { useState, useEffect } from "react";
import api from "@/services/api";

interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

const StaffPage = () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const response = await api.get("/users/my-staff");
        setStaff(response.data.data);
      } catch (error) {
        console.error("Error fetching staff:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStaff();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-primary">Staff</h1>
        <button
          onClick={() => console.log("Add Staff clicked")}
          className="bg-primary text-white px-4 py-2 rounded-lg"
        >
          Add Staff
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
                Email
              </th>
              <th className="px-6 py-3 border-b-2 border-gray-300"></th>
            </tr>
          </thead>
          <tbody>
            {staff.map((member) => (
              <tr key={member.id}>
                <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">
                  {member.firstName} {member.lastName}
                </td>
                <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">
                  {member.email}
                </td>
                <td className="px-6 py-4 whitespace-no-wrap text-right border-b border-gray-500">
                  <button
                    onClick={() => console.log(`Remove staff ${member.id}`)}
                    className="px-5 py-2 border-red-500 border text-red-500 rounded transition duration-300 hover:bg-red-500 hover:text-white focus:outline-none"
                  >
                    Remove
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

export default StaffPage;
