"use client";

import React, { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "@/context/AuthContext";

const CreateParticipant: React.FC = () => {
  // Bulk Upload State (Individual fields)
  const [excelFile, setExcelFile] = useState<File | null>(null);
  
  // credential from auth
  const {user} = useAuth();
  const organizationId =  user?.organizationId.toString();
  const adminId = user?.id;

  const [excelUploadLoading, setExcelUploadLoading] = useState(false);
  const [singleUplaodLoding, setSingleUplaodLoading] = useState(false)

  // Single Participant State (Individual fields)
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");


  // Handle Bulk Upload
  const handleExcelUpload = async () => {
    if (!excelFile) {
      toast.error("All bulk fields are required.");
      return;
    }

    const formData = new FormData();
    formData.append("file", excelFile);
    formData.append("organizationId", organizationId || '');
    formData.append("createdById", adminId?.toString() || '');
    setExcelUploadLoading(true)
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/participants/create-participant-file`, formData);
      toast.success(`${res.data.totalNewParticipants} participants created!`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Bulk upload failed.");
    } finally{
        setExcelUploadLoading(false)
    }
  };

  // Handle Single Create
  const handleSingleCreate = async () => {
    if (!name || !email || !mobileNumber) {
      toast.error("All single participant fields are required.");
      return;
    }
    setSingleUplaodLoading(true)
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/participants/create-single-participant`, {
        name,
        email,
        mobileNumber,
        organizationId: Number(organizationId),
        createdById: Number(adminId),
      });

      toast.success(`Participant ${name} created & email sent!`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Single creation failed.");
    } finally {
        setSingleUplaodLoading(false)
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 mt-10 bg-white shadow-lg rounded-xl border space-y-8">
      <h2 className="text-2xl font-bold text-center text-gray-800">Participant Creation</h2>

      {/* Bulk Upload */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700">Create Participant(Excel)</h3>

        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={(e) => setExcelFile(e.target.files?.[0] || null)}
          className="w-full border p-2 rounded-md"
        />

        <button
          onClick={handleExcelUpload}
          disabled={excelUploadLoading}
          className={`w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition`}
        >
          {
            excelUploadLoading ? "Uploading..." : "Upload Excel File"
          }
        </button>
      </div>

      <hr className="my-6 border-gray-300" />

      {/* Single Participant */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700">Single Participant Creation</h3>

        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border p-2 rounded-md"
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 rounded-md"
        />

        <input
          type="text"
          placeholder="Mobile Number"
          value={mobileNumber}
          onChange={(e) => setMobileNumber(e.target.value)}
          className="w-full border p-2 rounded-md"
        />

        <button
          onClick={handleSingleCreate}
          disabled={singleUplaodLoding}
          className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
        >
          {
            singleUplaodLoding ? "Creating..." : "Create Single Participant"
          }
        </button>
      </div>

      <ToastContainer position="top-center" />
    </div>
  );
};

export default CreateParticipant;
