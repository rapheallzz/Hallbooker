"use client";
import React, { useState, useEffect } from "react";
import api from "../../services/api";
import Swal from "sweetalert2";
import { Loader2, User as UserIcon, Shield, Mail, AlertTriangle, Trash2 } from "lucide-react";

interface UserProfile {
  _id: string;
  fullName: string;
  email: string;
  role: string[];
  phoneNumber?: string;
  deletionRequested?: boolean;
}

const SettingsView = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoadingProfile(true);
        const response = await api.get("/users/me");
        // API response structure might vary, adjust based on actual data
        setProfile(response.data.data || response.data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, []);

  const handleRequestDeletion = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This will place your account into a 'deletion-requested' state. An admin will review and approve your request. This action cannot be easily undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, request deletion",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        Swal.fire({
          title: "Processing...",
          didOpen: () => {
            Swal.showLoading();
          },
          allowOutsideClick: false,
        });

        await api.post("/users/request-deletion");

        // Refresh profile to update status
        const response = await api.get("/users/me");
        setProfile(response.data.data || response.data);

        Swal.fire(
          "Requested!",
          "Your account deletion request has been submitted to the admin.",
          "success"
        );
      } catch (error) {
        console.error("Error requesting deletion:", error);
        Swal.fire("Oops...", "Something went wrong! Please try again later.", "error");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      Swal.fire("Oops...", "New passwords do not match!", "error");
      return;
    }

    try {
      await api.patch("/users/change-password", {
        currentPassword,
        newPassword,
      });
      Swal.fire("Success!", "Your password has been changed.", "success");
    } catch (error) {
      console.error("Error changing password:", error);
      Swal.fire("Oops...", "Something went wrong!", "error");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Profile Settings</h2>

      {/* User Information Card */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <UserIcon className="w-5 h-5 text-primary" />
          Personal Information
        </h3>

        {loadingProfile ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : profile ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <UserIcon className="w-4 h-4" /> Full Name
              </p>
              <p className="text-lg text-gray-900">{profile.fullName}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Mail className="w-4 h-4" /> Email Address
              </p>
              <p className="text-lg text-gray-900">{profile.email}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Shield className="w-4 h-4" /> Roles
              </p>
              <div className="flex flex-wrap gap-2">
                {profile.role.map((r) => (
                  <span key={r} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full capitalize">
                    {r.replace('-', ' ')}
                  </span>
                ))}
              </div>
            </div>
            {profile.phoneNumber && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Phone Number</p>
                <p className="text-lg text-gray-900">{profile.phoneNumber}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500">Failed to load profile information.</p>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Change Password</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium text-gray-700">Current Password</label>
            <input
              type="password"
              className="w-full p-2 border rounded-md"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-700">New Password</label>
            <input
              type="password"
              className="w-full p-2 border rounded-md"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-700">Confirm New Password</label>
            <input
              type="password"
              className="w-full p-2 border rounded-md"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <div className="flex justify-end">
            <button type="submit" className="bg-primary text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors duration-300">
              Change Password
            </button>
          </div>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 p-6 rounded-lg border border-red-200 shadow-md">
        <h3 className="text-xl font-semibold text-red-800 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Danger Zone
        </h3>
        <p className="text-red-700 mb-6">
          Once you request account deletion, your account will be marked for removal and pending admin approval.
          You will no longer be able to make new bookings while this request is active.
        </p>

        {profile?.deletionRequested ? (
          <div className="bg-white p-4 rounded-md border border-red-300 flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="font-semibold text-red-800">Deletion Request Pending</p>
              <p className="text-sm text-red-700">You have already requested to delete your account. An admin is reviewing it.</p>
            </div>
          </div>
        ) : (
          <button
            onClick={handleRequestDeletion}
            className="flex items-center gap-2 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors duration-300 font-medium"
          >
            <Trash2 className="w-4 h-4" />
            Request Account Deletion
          </button>
        )}
      </div>
    </div>
  );
};

export default SettingsView;
