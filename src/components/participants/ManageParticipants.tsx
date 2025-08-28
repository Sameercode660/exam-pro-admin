"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "@/context/AuthContext";
import moment from "moment";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import PageHeading from "../utils/PageHeading";

type BatchOption = {
  label: string;
  batchId: number;
};

const ManageParticipants = () => {
  const { user } = useAuth();
  const adminId = user?.id;
  const organizationId = user?.organizationId;

  const [filter, setFilter] = useState<"my" | "all">("my");
  const [search, setSearch] = useState("");
  const [participants, setParticipants] = useState<any[]>([]);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editData, setEditData] = useState({
    id: 0,
    name: "",
    email: "",
    mobileNumber: "",
  });

  const [batches, setBatches] = useState<BatchOption[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<number | null>(null);

  // fetch batches 
  const fetchBatches = async () => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_ROOT_URL}/removed-data/batch-ids`,
        { organizationId: user?.organizationId, type: "visible-participants" }
      );
      setBatches(res.data);
      console.log(res.data)
    } catch (err) {
      console.error("Failed to fetch batches:", err);
    }
  };

  const fetchParticipants = async () => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_ROOT_URL}/participants/fetch-all-participant`,
        { search, filter, organizationId, adminId, batchId: selectedBatch }
      );
      setParticipants(res.data.participants);
      console.log(res.data.participants)
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to fetch participants");
    }
  };

  useEffect(() => {
    fetchParticipants();
    fetchBatches();
    // eslint-disable-next-line
  }, [filter, selectedBatch]);

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this participant?");
    if (!confirmDelete) return;

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_ROOT_URL}/participants/delete-participant`,
        { participantId: id, adminId: user?.id }
      );
      // toast.success("Participant deleted");
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

  // ✅ Export to Excel Function
  const handleExportToExcel = () => {
    if (participants.length === 0) {
      toast.warning("No participants to export.");
      return;
    }

    const exportData = participants.map((p) => ({
      Name: p.name,
      Email: p.email,
      Mobile: p.mobileNumber,
      Approved: p.approved ? "Yes" : "No",
      "Created At": moment(p.createdAt).format("DD/MM/YYYY"),
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Participants");

    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    saveAs(blob, "ParticipantList.xlsx");
  };

  return (

    <>
      <PageHeading title="Manage Participants"></PageHeading>
      <div className="p-6 max-w-6xl mx-auto bg-white rounded-xl shadow-md space-y-6">
        {/* Header with Export Button */}
        {/* <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800 text-center">
            Manage Participants
          </h2>

        </div> */}

        {/* Tabs */}
        {/* <div className="flex space-x-4 justify-center">
          <button
            onClick={() => setFilter("my")}
            className={`px-4 py-2 rounded-md ${filter === "my" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            My Participants
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-md ${filter === "all" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            All Participants
          </button>
        </div> */}


        {/* Search */}
        <div className="flex justify-between flex-wrap items-center gap-3">
          {/* Batch filter options */}

          {/* Tabs */}
          <div className="flex space-x-4 justify-center">
            <button
              onClick={() => setFilter("my")}
              className={`px-4 py-2 rounded-md ${filter === "my" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
            >
              My Participants
            </button>
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-md ${filter === "all" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
            >
              All Participants
            </button>
          </div>
          <div className="w-full md:w-auto ">
            <select
              className="border px-3 py-2 rounded-md h-10 w-35"
              value={selectedBatch ?? ""}
              onChange={(e) => {
                setSelectedBatch(e.target.value ? Number(e.target.value) : null);
              }}
            >
              <option value="">All Batches</option>
              {batches.map((batch) => (
                <option key={batch.batchId} value={batch.batchId}>
                  {batch.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-center items-center space-x-3">
            <input
              type="text"
              placeholder="Search participants by name, email, mobile"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border rounded-md px-3 h-10 w-full md:w-64"
            />

            <button
              onClick={handleSearch}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 rounded-md h-10"
            >
              Search
            </button>
          </div>

          <button
            onClick={handleExportToExcel}
            className="bg-green-500 hover:bg-green-600 text-white px-4 rounded-md h-10 w-35"
          >
            Export to Excel
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
                <th className="px-4 py-3 text-left">Password</th>
                <th className="px-4 py-3 text-left">Approved</th>
                <th className="px-4 py-3 text-left">Created At</th>
                <th className="px-4 py-3 text-left">BatchId</th>
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
                    <td className="p-3">{p.password}</td>
                    <td className="p-3">
                      {p.approved ? (
                        <span className="text-green-600 font-semibold">Yes</span>
                      ) : (
                        <span className="text-red-600 font-semibold">No</span>
                      )}
                    </td>
                    <td className="p-3">
                      {moment(p.createdAt).format("DD/MM/YYYY hh:mm A")}
                    </td>
                    <td className="p-3">{p.batchId}</td>
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
    </>
  );
};

export default ManageParticipants;
