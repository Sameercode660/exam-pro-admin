"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "@/context/AuthContext";
import moment from "moment";

const ManageParticipants = () => {
  const { user } = useAuth();
  const adminId = user?.id;
  const organizationId = user?.organizationId;

  const [filter, setFilter] = useState<"my" | "all">("my");
  const [search, setSearch] = useState("");
  const [participants, setParticipants] = useState<any[]>([]);

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editData, setEditData] = useState({
    id: 0,
    name: "",
    email: "",
    mobileNumber: "",
  });

  const fetchParticipants = async () => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_ROOT_URL}/participants/fetch-all-participant`,
        {
          search,
          filter,
          organizationId,
          adminId,
        }
      );

      setParticipants(res.data.participants);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to fetch participants");
    }
  };

  useEffect(() => {
    fetchParticipants();
    // eslint-disable-next-line
  }, [filter]);

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this participant?");
    if (!confirmDelete) return;

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_ROOT_URL}/participants/delete-participant`,
        { participantId: id,
          adminId: user?.id
         }
      );
      toast.success("Participant deleted");
      fetchParticipants();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Delete failed.");
    }
  };

  const handleEditClick = async (id: number) => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_ROOT_URL}/participants/fetch-single-participant`,
        { participantId: id }
      );

      const participant = res.data.participant;
      setEditData({
        id: participant.id,
        name: participant.name,
        email: participant.email,
        mobileNumber: participant.mobileNumber,
      });

      setEditModalOpen(true);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to fetch participant details.");
    }
  };

  const handleEditSubmit = async () => {
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_ROOT_URL}/participants/update-participant`, {
        ...editData,
        updatedById: adminId,
      });

      toast.success("Participant updated successfully.");
      setEditModalOpen(false);
      fetchParticipants();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Update failed.");
    }
  };

  const handleSearch = () => {
    fetchParticipants();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto mt-10 bg-white rounded-xl shadow-md space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 text-center">
        Manage Participants
      </h2>

      {/* Tabs */}
      <div className="flex space-x-4 justify-center">
        <button
          onClick={() => setFilter("my")}
          className={`px-4 py-2 rounded-md ${
            filter === "my"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          My Participants
        </button>
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-md ${
            filter === "all"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          All Participants
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <input
          type="text"
          placeholder="Search participants..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border p-2 rounded-md"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          Search
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 text-sm">
          <thead className="bg-[#f1e9d9] text-gray-800 font-semibold">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Mobile</th>
              <th className="px-4 py-3 text-left">Approved</th>
              <th className="px-4 py-3 text-left">Created At</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {participants.length === 0 ? (
              <tr className="hover:bg-gray-100 border-b">
                <td colSpan={6} className="text-center p-4">
                  No participants found.
                </td>
              </tr>
            ) : (
              participants.map((p) => (
                <tr key={p.id} className="hover:bg-gray-100 border-b">
                  <td className="p-3">{p.name}</td>
                  <td className="p-3">{p.email}</td>
                  <td className="p-3">{p.mobileNumber}</td>
                  <td className="p-3">
                    {p.approved ? (
                      <span className="text-green-600 font-semibold">Yes</span>
                    ) : (
                      <span className="text-red-600 font-semibold">No</span>
                    )}
                  </td>
                  <td className="p-3">{moment(p.createdAt).format("DD/MM/YYYY")}</td>
                  <td className="p-3 border space-x-4 text-center">
                    <button
                      className="text-yellow-600 hover:underline"
                      onClick={() => handleEditClick(p.id)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => handleDelete(p.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg space-y-4 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-800">Edit Participant</h3>

            <input
              type="text"
              placeholder="Name"
              value={editData.name}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              className="w-full border p-2 rounded-md"
            />
            <input
              type="email"
              placeholder="Email"
              value={editData.email}
              onChange={(e) => setEditData({ ...editData, email: e.target.value })}
              className="w-full border p-2 rounded-md"
            />
            <input
              type="text"
              placeholder="Mobile Number"
              value={editData.mobileNumber}
              onChange={(e) => setEditData({ ...editData, mobileNumber: e.target.value })}
              className="w-full border p-2 rounded-md"
            />

            <div className="flex justify-end space-x-4 pt-2">
              <button
                onClick={() => setEditModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-center" />
    </div>
  );
};

export default ManageParticipants;
