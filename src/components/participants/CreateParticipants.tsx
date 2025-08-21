"use client";

import React, { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "@/context/AuthContext";
import { downloadUploadSummaryExcel } from "@/lib/summary-download";
import BatchSummaryPupup from "../utils/BatchSummaryPupup";

const CreateParticipant: React.FC = () => {
  // Bulk Upload State (Individual fields)
  const [excelFile, setExcelFile] = useState<File | null>(null);

  // credential from auth
  const { user } = useAuth();
  const organizationId = user?.organizationId.toString();
  const adminId = user?.id;

  const [excelUploadLoading, setExcelUploadLoading] = useState(false);
  const [singleUplaodLoding, setSingleUplaodLoading] = useState(false)

  // Single Participant State (Individual fields)
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");

  const [open, setOpen] = useState(false);
  const [batchData, setBatchData] = useState({
    batchId: 0,
    batchStatus: "FAILED",
    failed: 0,
    inserted: 0,
    message: "Upload completed",
    skipped: 0,
  });
  // Handle Bulk Upload
  const handleExcelUpload = async () => {
    if (!excelFile) {
      toast.error("You haven't choosen a file");
      return;
    }

    const formData = new FormData();
    formData.append("file", excelFile);
    formData.append("organizationId", organizationId || '');
    formData.append("createdById", adminId?.toString() || '');
    setExcelUploadLoading(true)
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/participants/create-participant-file`, formData);
      console.log(res.data);
      downloadUploadSummaryExcel(res.data.summaryData, "Participants")
      setOpen(true)
      setBatchData({
        batchId: res.data.batchId,
        batchStatus: res.data.batchStatus,
        failed: res.data.failed,
        inserted: res.data.inserted,
        message: res.data.message,
        skipped: res.data.skipped,
      })
      toast.success(`${res.data.inserted} participants created!`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Upload failed");
    } finally {
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

  // downlad excel file functin 
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = "https://docs.google.com/spreadsheets/d/1H5fNF9kPYii7ElicRM1TlA5Y4x3IRknD/export?format=xlsx";
    link.download = "Excel_Sample.xlsx"; // suggested filename
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 mt-10 bg-white shadow-lg rounded-xl border space-y-8">
      <BatchSummaryPupup
        data={batchData}
        isOpen={open}
        onClose={() => setOpen(false)}
      />
      <h2 className="text-2xl font-bold text-center text-gray-800">Participant Creation</h2>

      {/* Bulk Upload */}
      <div className="space-y-4">
        <div className="flex justify-end">
          {/* <h3 className="text-lg font-semibold text-gray-700">Create Participant(Excel)</h3> */}

          <button
            onClick={handleDownload}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 text-sm font-medium"
          >
            📥 Download Excel Template
          </button>
        </div>
        <div>
          <label className="block w-full border p-2 rounded-md cursor-pointer bg-gray-50 hover:bg-gray-100 text-gray-600">
            {excelFile ? excelFile.name : "Select a file for upload"}
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={(e) => setExcelFile(e.target.files?.[0] || null)}
              className="hidden"
            />
          </label>
        </div>

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
