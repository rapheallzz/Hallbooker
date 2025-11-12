"use client";
import React, { useState } from "react";
import api from "../../services/api";
import Swal from "sweetalert2";

const SettingsView = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e) => {
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
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Profile Settings</h2>
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
    </div>
  );
};

export default SettingsView;
