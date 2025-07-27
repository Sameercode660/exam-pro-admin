"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import DynamicTable from "../utils/DynamicTable";

type RemovedParticipant = {
  id: number;
  name: string;
  mobileNumber: string;
  createdAt: string;
  createdBy: string;
  removedBy: string | null;
};

export default function RemovedParticipants() {
  const [participants, setParticipants] = useState<RemovedParticipant[]>([]);
  const { user } = useAuth();

  const fetchParticipants = async () => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_ROOT_URL}/removed-data/removed-participants/fetch-removed-participants`,
        { organizationId: user?.id }
      );
      setParticipants(res.data.data);
    } catch (err) {
      console.error("Failed to fetch participants:", err);
    }
  };

  useEffect(() => {
    fetchParticipants();
  }, []);

  const handleRestore = async (participantId: number) => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_ROOT_URL}/removed-data/removed-participants/restore-removed-participants`,
        { participantId }
      );
      fetchParticipants();
    } catch (err) {
      console.error("Restore failed:", err);
    }
  };

  const columns = [
    "Name",
    "Mobile Number",
    "Created At",
    "Created By",
    "Removed By",
    "Action",
  ];

  const formattedData = participants.map((p) => ({
    "Name": p.name,
    "Mobile Number": p.mobileNumber,
    "Created At": new Date(p.createdAt).toLocaleString(),
    "Created By": p.createdBy,
    "Removed By": p.removedBy || "-",
    "Action": p.id, // will use this for custom restore button
  }));

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Removed Participants</h1>

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
