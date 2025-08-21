"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import DynamicTable from "../utils/DynamicTable";

type RemovedParticipant = {
  id: number;
  name: string;
  batchId: number;
  mobileNumber: string;
  createdAt: string;
  removedAt: string;
  createdBy: string;
  removedBy: string | null;
};

type BatchOption = {
  label: string;
  batchId: number;
};

export default function RemovedParticipants() {
  const [participants, setParticipants] = useState<RemovedParticipant[]>([]);
  const { user } = useAuth();
  const [batches, setBatches] = useState<BatchOption[]>([]);
    const [selectedBatch, setSelectedBatch] = useState<number | null>(null);
  


  // fetch batches 
  const fetchBatches = async () => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_ROOT_URL}/removed-data/batch-ids`,
        { organizationId: user?.organizationId, type: "participants" }
      );
      setBatches(res.data);
    } catch (err) {
      console.error("Failed to fetch batches:", err);
    }
  };

  const fetchParticipants = async () => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_ROOT_URL}/removed-data/removed-participants/fetch-removed-participants`,
        { organizationId: user?.id, batchId: Number(selectedBatch) }
      );
      console.log(res.data.data)
      setParticipants(res.data.data);
    } catch (err) {
      console.error("Failed to fetch participants:", err);
    }
  };

  useEffect(() => {
    fetchParticipants();
    fetchBatches()
  }, [selectedBatch]);

  const handleRestore = async (participantId: number) => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_ROOT_URL}/removed-data/removed-participants/restore-removed-participants`,
        { participantId, adminId: user?.id }
      );
      fetchParticipants();
    } catch (err) {
      console.error("Restore failed:", err);
    }
  };

  const columns = [
    "BatchId",
    "Name",
    "Mobile Number",
    "Created At",
    "Removed At",
    "Created By",
    "Removed By",
    "Action",
  ];

  const formattedData = participants.map((p) => ({
    "BatchId": p.batchId,
    "Name": p.name,
    "Mobile Number": p.mobileNumber,
    "Created At": new Date(p.createdAt).toLocaleString(),
    "Removed At": new Date(p.removedAt).toLocaleString(),
    "Created By": p.createdBy,
    "Removed By": p.removedBy || "-",
    "Action": p.id, 
  }));

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Removed Participants</h1>

         <div className="mb-4">
        <select
          className="border px-3 py-2 rounded w-full md:w-1/3"
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
      <DynamicTable
        columns={columns}
        data={formattedData}
        searchable={true}
        renderCell={(row, col) => {
          if (col === "Action") {
            return (
              <button
                onClick={() => handleRestore(row[col])}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded cursor-pointer"
              >
                Restore
              </button>
            );
          }
          return row[col];
        }}
      />
    </div>
  );
}
