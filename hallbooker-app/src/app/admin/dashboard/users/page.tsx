
"use client";
import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
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
            className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary w-full text-gray-900"
          />
        </div>
        <div className="w-full md:w-1/4">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="block w-full p-2 border border-gray-300 rounded-md text-gray-900"
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="hall-owner">Hall Owner</option>
            <option value="staff">Staff</option>
            <option value="super-admin">Super Admin</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto shadow-sm border rounded-lg">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Roles</th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedUsers.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{user.fullName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.role.join(", ")}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleEditUser(user)} className="text-indigo-600 hover:text-indigo-900 mr-3">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => handleDeleteUser(user._id)} className="text-red-600 hover:text-red-900">
                    <Trash size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md disabled:opacity-50">
          Previous
        </button>
        <span className="text-sm text-gray-800">
          Page {currentPage} of {totalPages}
        </span>
        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md disabled:opacity-50">
          Next
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
    Swal.fire({
      title: "Approving...",
      text: "Please wait while the application is being approved.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
    try {
      await api.patch(`/admin/hall-owner-applications/${userId}/approve`);
      Swal.fire("Approved!", "The application has been approved.", "success");
      fetchApplications(); // Refresh data
    } catch (error) {
      console.error("Error approving application:", error);
      Swal.fire("Error", "Could not approve the application.", "error");
    }
  };

  const handleReject = async (userId: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You are about to reject this application.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, reject it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Rejecting...",
          text: "Please wait while the application is being rejected.",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });
        try {
          await api.patch(`/admin/hall-owner-applications/${userId}/reject`);
          Swal.fire("Rejected!", "The application has been rejected.", "success");
          fetchApplications(); // Refresh data
        } catch (error) {
          console.error("Error rejecting application:", error);
          Swal.fire("Error", "Could not reject the application.", "error");
        }
      }
    });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="overflow-x-auto shadow-sm border rounded-lg">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-50">
          <tr>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Current Roles</th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {applications.length > 0 ? (
            applications.map((app) => (
              <tr key={app._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{app.fullName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{app.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{app.role?.join(", ") || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleApprove(app._id)} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded mr-2">
                    Approve
                  </button>
                  <button onClick={() => handleReject(app._id)} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
                    Reject
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="text-center py-8 text-gray-800">
                No pending applications found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const DeletionRequestsTab = () => {
  const [requests, setRequests] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/deletion-requests");
      setRequests(response.data.data);
    } catch (error) {
      console.error("Error fetching deletion requests:", error);
      Swal.fire("Error", "Could not fetch deletion requests.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This will deactivate the account for deletion.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, approve it!",
    });

    if (result.isConfirmed) {
      Swal.fire({
        title: "Approving...",
        text: "Please wait...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      try {
        await api.patch(`/admin/deletion-requests/${userId}/approve`);
        Swal.fire("Approved!", "The deletion request has been approved.", "success");
        fetchRequests();
      } catch (error) {
        console.error("Error approving deletion request:", error);
        Swal.fire("Error", "Could not approve the deletion request.", "error");
      }
    }
  };

  const handleDecline = async (userId: string) => {
    Swal.fire({
      title: "Declining...",
      text: "Please wait...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
    try {
      await api.patch(`/admin/deletion-requests/${userId}/decline`);
      Swal.fire("Declined!", "The deletion request has been declined.", "success");
      fetchRequests();
    } catch (error) {
      console.error("Error declining deletion request:", error);
      Swal.fire("Error", "Could not decline the deletion request.", "error");
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="overflow-x-auto shadow-sm border rounded-lg">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-50">
          <tr>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Roles</th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {requests.length > 0 ? (
            requests.map((request) => (
              <tr key={request._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{request.fullName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.role?.join(", ") || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleApprove(request._id)} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded mr-2">
                    Approve
                  </button>
                  <button onClick={() => handleDecline(request._id)} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
                    Decline
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="text-center py-8 text-gray-800">
                No account deletion requests found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const UsersPageContent = () => {
  const [activeTab, setActiveTab] = useState("allUsers");

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Manage Users</h1>
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
            <button
              onClick={() => setActiveTab("deletions")}
              className={`${
                activeTab === "deletions"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Deletion Requests
            </button>
          </nav>
        </div>

        <div className="mt-8">
          {activeTab === "allUsers" && <AllUsersTab />}
          {activeTab === "pending" && <PendingApplicationsTab />}
          {activeTab === "deletions" && <DeletionRequestsTab />}
        </div>
      </div>
    </div>
  );
};

const UsersPage = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <UsersPageContent />
  </Suspense>
);

export default withAuth(UsersPage, ["super-admin"]);
