"use client";
import React, { useState, useEffect } from "react";
import api from "@/services/api";
import Swal from "sweetalert2";
import LoadingSpinner from "@/components/admin/LoadingSpinner";

interface Application {
  _id: string;
  fullName: string;
  email: string;
  // Add other application fields as needed
}

const HallOwnerApplications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await api.get("/admin");
      setApplications(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (error) {
      console.error("Error fetching applications:", error);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Failed to fetch applications!',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You are about to approve this hall owner application.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, approve it!'
    });

    if (result.isConfirmed) {
      try {
        await api.patch(`/admin/${userId}/approve`);
        Swal.fire(
          'Approved!',
          'The application has been approved.',
          'success'
        );
        fetchApplications(); // Refresh the list
      } catch (error) {
        console.error("Error approving application:", error);
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Failed to approve application!',
        });
      }
    }
  };

  const handleReject = async (userId: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You are about to reject this hall owner application.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, reject it!'
    });

    if (result.isConfirmed) {
      try {
        await api.patch(`/admin/${userId}/reject`);
        Swal.fire(
          'Rejected!',
          'The application has been rejected.',
          'success'
        );
        fetchApplications(); // Refresh the list
      } catch (error) {
        console.error("Error rejecting application:", error);
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Failed to reject application!',
        });
      }
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="bg-white p-4 shadow-lg rounded-lg">
      {applications.length === 0 ? (
        <p>No pending applications.</p>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {applications.map((app) => (
              <tr key={app._id}>
                <td className="px-6 py-4 whitespace-nowrap">{app.fullName}</td>
                <td className="px-6 py-4 whitespace-nowrap">{app.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleApprove(app._id)} className="text-green-600 hover:text-green-900 mr-4">Approve</button>
                  <button onClick={() => handleReject(app._id)} className="text-red-600 hover:text-red-900">Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default HallOwnerApplications;
