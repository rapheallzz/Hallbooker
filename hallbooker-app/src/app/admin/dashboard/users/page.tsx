"use client";
import React, { useState, useEffect, useMemo } from "react";
import withAuth from "@/components/auth/withAuth";
import api from "@/services/api";
import Swal from "sweetalert2";
import LoadingSpinner from "@/components/admin/LoadingSpinner";
import { Search, Trash, Edit, ChevronLeft, ChevronRight } from "lucide-react";

interface User {
  _id: string;
  fullName: string;
  email: string;
  role: string[];
}

const USERS_PER_PAGE = 10;

const AllUsersTab = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get("/users");
      setUsers(response.data.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      Swal.fire("Error", "Could not fetch users.", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users
      .filter((user) =>
        roleFilter ? user.role.includes(roleFilter) : true
      )
      .filter(
        (user) =>
          user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [users, searchTerm, roleFilter]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * USERS_PER_PAGE;
    return filteredUsers.slice(startIndex, startIndex + USERS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the user's account.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/users/${userId}`);
        Swal.fire("Deleted!", "The user has been deleted.", "success");
        fetchUsers(); // Refresh data
      } catch (error) {
        console.error("Error deleting user:", error);
        Swal.fire("Error", "Could not delete the user.", "error");
      }
    }
  };

  const handleEditUser = (user: User) => {
    Swal.fire(
      "Edit User",
      `Editing functionality for ${user.fullName} would be implemented here.`,
      "info"
    );
  };

  if (loading) return <LoadingSpinner />;

  return (
    <>
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="relative w-full md:w-1/3">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary w-full"
          />
        </div>
        <div className="w-full md:w-1/4">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="block w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="hall-owner">Hall Owner</option>
            <option value="staff">Staff</option>
            <option value="super-admin">Super Admin</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Email
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Roles
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedUsers.map((user) => (
              <tr key={user._id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                  {user.fullName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.role.join(", ")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEditUser(user)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
        >
          <ChevronLeft size={18} /> Previous
        </button>
        <span className="text-sm text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
        >
          Next <ChevronRight size={18} />
        </button>
      </div>
    </>
  );
};

const PendingApplicationsTab = () => {
  const [applications, setApplications] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/hall-owner-applications");
      setApplications(response.data.data);
    } catch (error) {
      console.error("Error fetching applications:", error);
      Swal.fire("Error", "Could not fetch pending applications.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This will approve the user's application.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      confirmButtonText: 'Yes, approve it!'
    });

    if (result.isConfirmed) {
      try {
        await api.patch(`/admin/hall-owner-applications/${userId}/approve`);
        Swal.fire('Approved!', 'The application has been approved.', 'success');
        fetchApplications(); // Refresh data
      } catch (error) {
        console.error("Error approving application:", error);
        Swal.fire('Error', 'Could not approve the application.', 'error');
      }
    }
  };

    const handleReject = async (userId: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This will reject the user's application.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, reject it!'
    });

    if (result.isConfirmed) {
      try {
        await api.patch(`/admin/hall-owner-applications/${userId}/reject`);
        Swal.fire('Rejected!', 'The application has been rejected.', 'success');
        fetchApplications(); // Refresh data
      } catch (error) {
        console.error("Error rejecting application:", error);
        Swal.fire('Error', 'Could not reject the application.', 'error');
      }
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Current Roles
            </th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {applications.length > 0 ? (
            applications.map((app) => (
              <tr key={app._id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{app.fullName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.role?.join(", ") || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleApprove(app._id)}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded mr-2"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(app._id)}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="text-center py-8 text-gray-500">
                No pending applications found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const UsersPage = () => {
  const [activeTab, setActiveTab] = useState("allUsers");

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-primary">Manage Users</h1>
      <div className="bg-white p-6 shadow-lg rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("allUsers")}
              className={`${
                activeTab === "allUsers"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              All Users
            </button>
            <button
              onClick={() => setActiveTab("pending")}
              className={`${
                activeTab === "pending"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Pending Applications
            </button>
          </nav>
        </div>

        <div className="mt-8">
          {activeTab === "allUsers" && <AllUsersTab />}
          {activeTab === "pending" && <PendingApplicationsTab />}
        </div>
      </div>
    </div>
  );
};

export default withAuth(UsersPage, ["super-admin"]);
